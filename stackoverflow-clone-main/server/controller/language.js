import user from "../models/auth.js";
import nodemailer from "nodemailer";

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendEmailOTP(toEmail, otp, language) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Code-Quest" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Language Change OTP – Code-Quest",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;">
        <h2 style="color:#1a73e8;">Language Change Verification</h2>
        <p>You requested to switch the platform language to <strong>${language.toUpperCase()}</strong>.</p>
        <p>Your OTP is:</p>
        <div style="background:#f4f4f4;padding:20px;border-radius:8px;font-size:28px;
                    font-weight:bold;text-align:center;letter-spacing:6px;">
          ${otp}
        </div>
        <p style="margin-top:16px;color:#555;">This OTP expires in 10 minutes.</p>
        <p style="color:#999;font-size:12px;">Code-Quest Team</p>
      </div>
    `,
  });
}

// POST /language/request-otp  (auth required)
// French → email OTP, all others → mobile OTP (simulated here)
export const requestLanguageOTP = async (req, res) => {
  const { language } = req.body;
  const userId = req.userid;

  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return res.status(400).json({ message: "Unsupported language" });
  }

  try {
    const foundUser = await user.findById(userId);
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await user.findByIdAndUpdate(userId, {
      languageOtpCode: otp,
      languageOtpExpiry: expiry,
    });

    if (language === "fr") {
      // Email OTP for French
      await sendEmailOTP(foundUser.email, otp, language);
      return res.status(200).json({
        message: "OTP sent to your registered email address.",
        method: "email",
      });
    } else {
      // Mobile OTP for all other languages
      // In production integrate Twilio/MSG91 here.
      // For demo we return it so the developer can test.
      return res.status(200).json({
        message: `OTP sent to your registered mobile number.`,
        method: "mobile",
        // Remove otp from response in production:
        devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// POST /language/verify-otp  (auth required)
export const verifyLanguageOTP = async (req, res) => {
  const { otp, language } = req.body;
  const userId = req.userid;

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

    await user.findByIdAndUpdate(userId, {
      language,
      languageOtpCode: "",
      languageOtpExpiry: null,
    });

    res.status(200).json({ message: "Language updated successfully", language });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /language/current  (auth required)
export const getCurrentLanguage = async (req, res) => {
  try {
    const foundUser = await user.findById(req.userid).select("language");
    res.status(200).json({ language: foundUser?.language || "en" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};