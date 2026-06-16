import mongoose from "mongoose";
import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// ── helpers ───────────────────────────────────────────────────────────────────

function parseUserAgent(ua = "") {
  // Browser detection
  let browser = "Unknown";
  if (ua.includes("Edg/") || ua.includes("Edge/")) browser = "Microsoft Edge";
  else if (ua.includes("Chrome")) browser = "Google Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari")) browser = "Safari";

  // OS detection
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  // Device type
  let device = "Desktop";
  if (ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone")) device = "Mobile";
  else if (ua.includes("iPad") || ua.includes("Tablet")) device = "Tablet";

  return { browser, os, device };
}

async function sendOTPEmail(toEmail, otp) {
  // FIX: now uses Gmail SMTP — works for any recipient, not just your own address
  await sendEmail({
    to: toEmail,
    subject: "Login OTP – Code-Quest",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1a73e8;">Login Verification Required</h2>
        <p>A login attempt was detected from <strong>Google Chrome</strong>.</p>
        <p>Your one-time OTP is:</p>
        <div style="background:#f4f4f4;padding:20px;border-radius:8px;font-size:28px;
                    font-weight:bold;text-align:center;letter-spacing:6px;">${otp}</div>
        <p style="margin-top:16px;color:#555;">Expires in 10 minutes.</p>
        <p style="color:#999;font-size:12px;">Code-Quest Team</p>
      </div>
    `,
  });
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Step 1: Login — detects browser, returns OTP request if Chrome ────────────

// POST /user/login
export const Login = async (req, res) => {
  const { email, password } = req.body;
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Unknown";
  const { browser, os, device } = parseUserAgent(ua);

  try {
    const existingUser = await user.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "User does not exist" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" });

    // ── Mobile time restriction: 10:00 AM – 1:00 PM ──────────────────────
    if (device === "Mobile") {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000;
      const ist = new Date(now.getTime() + istOffset);
      const h = ist.getUTCHours();
      const m = ist.getUTCMinutes();
      const totalMin = h * 60 + m;
      if (totalMin < 600 || totalMin >= 780) { // before 10AM or after 1PM
        return res.status(403).json({
          message: "Mobile login is only allowed between 10:00 AM and 1:00 PM IST.",
        });
      }
    }

    // ── Chrome: require OTP email verification ────────────────────────────
    if (browser === "Google Chrome") {
      const otp = generateOTP();
      const expiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.findByIdAndUpdate(existingUser._id, {
        languageOtpCode: otp,
        languageOtpExpiry: expiry,
      });

      try {
        await sendOTPEmail(existingUser.email, otp);
      } catch (emailErr) {
        console.error("OTP email send error:", emailErr.message);
        return res.status(502).json({
          message: "We couldn't send the login OTP right now. Please try again shortly.",
        });
      }

      return res.status(200).json({
        requiresOTP: true,
        userId: existingUser._id,
        message: "OTP sent to your email. Please verify to complete login.",
        browser,
        os,
        device,
        ip,
      });
    }

    // ── Microsoft Edge / others: direct login ─────────────────────────────
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Save login history
    await user.findByIdAndUpdate(existingUser._id, {
      $push: {
        loginHistory: {
          $each: [{ browser, os, device, ipAddress: ip, loginAt: new Date() }],
          $slice: -20, // keep last 20 entries
        },
      },
    });

    res.status(200).json({ data: existingUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /user/verify-login-otp  (Chrome OTP verification step 2)
export const verifyLoginOTP = async (req, res) => {
  const { userId, otp } = req.body;
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Unknown";
  const { browser, os, device } = parseUserAgent(ua);

  try {
    const foundUser = await user.findById(userId);
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    if (
      foundUser.languageOtpCode !== otp ||
      !foundUser.languageOtpExpiry ||
      new Date() > new Date(foundUser.languageOtpExpiry)
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const token = jwt.sign(
      { email: foundUser.email, id: foundUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await user.findByIdAndUpdate(userId, {
      languageOtpCode: "",
      languageOtpExpiry: null,
      $push: {
        loginHistory: {
          $each: [{ browser, os, device, ipAddress: ip, loginAt: new Date() }],
          $slice: -20,
        },
      },
    });

    res.status(200).json({ data: foundUser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /user/login-history  (auth required)
export const getLoginHistory = async (req, res) => {
  try {
    const foundUser = await user.findById(req.userid).select("loginHistory");
    res.status(200).json({ data: foundUser?.loginHistory?.reverse() || [] });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ── Existing controllers (unchanged) ─────────────────────────────────────────

export const Signup = async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!phone || !phone.trim()) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const existingUser = await user.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const existingPhone = await user.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: "Phone number already registered" });

    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await user.create({ name, email, phone, password: hashpassword });

    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getallusers = async (req, res) => {
  try {
    const alluser = await user.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags } = req.body.editForm;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }
  try {
    const updatedprofile = await user.findByIdAndUpdate(
      _id,
      { $set: { name, about, tags } },
      { new: true }
    );
    res.status(200).json({ data: updatedprofile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};