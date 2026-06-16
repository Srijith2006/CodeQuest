import user from "../models/auth.js";
import { sendEmail } from "../utils/sendEmail.js";

const SUPPORTED_LANGUAGES = ["en", "es", "hi", "pt", "zh", "fr"];

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Send OTP via Gmail SMTP ────────────────────────────────────────────────
async function sendEmailOTP(toEmail, otp, language, userName) {
  await sendEmail({
    to: toEmail,
    subject: "Language Change OTP - Code-Quest",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;
                  border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1a73e8,#0d47a1);
                    color:#fff;padding:24px;text-align:center;">
          <h2 style="margin:0;">Language Change Verification</h2>
        </div>
        <div style="padding:24px;">
          <p>Hi <strong>${userName || "there"}</strong>,</p>
          <p>You requested to switch the platform language to
             <strong>${language.toUpperCase()}</strong>.</p>
          <p>Your OTP is:</p>
          <div style="background:#f4f4f4;padding:20px;border-radius:8px;
                      font-size:32px;font-weight:bold;text-align:center;
                      letter-spacing:8px;color:#1a73e8;">
            ${otp}
          </div>
          <p style="margin-top:16px;color:#e53935;font-size:13px;">
            This OTP expires in 10 minutes.
          </p>
          <p style="color:#777;font-size:13px;">
            If you did not request this, please ignore this email.
          </p>
          <p style="color:#999;font-size:12px;">Code-Quest Team</p>
        </div>
      </div>
    `,
  });
}

// ── Send OTP via Fast2SMS (DLT Configuration) ──────────────────────────────
async function sendSMSOTP(toPhone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    throw new Error("FAST2SMS_NOT_CONFIGURED");
  }

  // Strip country code — Fast2SMS needs a clean 10-digit Indian number
  const phone = toPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
  if (phone.length !== 10) {
    throw new Error("Invalid Indian mobile number. Must be exactly 10 digits.");
  }

  const { default: axios } = await import("axios");

  let responseData;
  try {
    // Uses official system DLT Template for OTPs to bypass website verification blocks
    const response = await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: apiKey,
        route: "dlt",                       // Routes via official DLT pipelines
        sender_id: "FSTSMS",               // Pre-approved Fast2SMS standard header
        message: "167571",                 // Standard free system template ID for OTPs
        variables_values: String(otp),     // Dynamic numeric variable injection
        numbers: phone,
      },
      validateStatus: () => true,          // Prevents axios from throwing on 4xx/5xx responses
    });

    responseData = response.data;

    // Log tracking structures directly to Render environment terminal
    console.log("Fast2SMS response status:", response.status);
    console.log("Fast2SMS response body:", JSON.stringify(responseData));

    if (!responseData || responseData.return === false) {
      const reason = Array.isArray(responseData?.message)
        ? responseData.message.join(", ")
        : responseData?.message || `HTTP ${response.status} from Fast2SMS`;
      throw new Error(`Fast2SMS error: ${reason}`);
    }
  } catch (err) {
    if (!responseData) {
      console.error("Fast2SMS network error:", err.message);
      throw new Error("Could not reach Fast2SMS. Check network/API URL.");
    }
    throw err;
  }
}

// ── POST /language/request-otp  (auth required) ──────────────────────────────
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

    // ── FRENCH: send OTP to email ─────────────────────────────────────────
    if (language === "fr") {
      if (!foundUser.email) {
        return res.status(400).json({ message: "No email on file for this account" });
      }
      try {
        await sendEmailOTP(foundUser.email, otp, language, foundUser.name);
        return res.status(200).json({
          message: `OTP sent to your registered email (${maskEmail(foundUser.email)}).`,
          method: "email",
        });
      } catch (err) {
        console.error("French email OTP error:", err.message);
        return res.status(500).json({
          message: "Failed to send OTP email. Check EMAIL_USER/EMAIL_PASS environment variables.",
        });
      }
    }

    // ── OTHER LANGUAGES: send OTP via SMS ────────────────────────────────
    if (!foundUser.phone) {
      return res.status(400).json({
        message: "No phone number on file. Please add your phone number to your profile first.",
      });
    }

    try {
      await sendSMSOTP(foundUser.phone, otp);
      return res.status(200).json({
        message: `OTP sent via SMS to (${maskPhone(foundUser.phone)}).`,
        method: "mobile",
      });
    } catch (smsErr) {
      if (smsErr.message === "FAST2SMS_NOT_CONFIGURED") {
        return res.status(500).json({
          message: "SMS service not configured. Contact the administrator.",
        });
      }
      console.error("SMS OTP error:", smsErr.message);
      return res.status(500).json({
        message: "Failed to send SMS OTP: " + smsErr.message,
      });
    }
  } catch (error) {
    console.error("requestLanguageOTP error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ── POST /language/verify-otp  (auth required) ────────────────────────────────
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
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new one." });
    }

    await user.findByIdAndUpdate(userId, {
      language,
      languageOtpCode: "",
      languageOtpExpiry: null,
    });

    res.status(200).json({ message: "Language updated successfully", language });
  } catch (error) {
    console.error("verifyLanguageOTP error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ── GET /language/current  (auth required) ────────────────────────────────────
export const getCurrentLanguage = async (req, res) => {
  try {
    const foundUser = await user.findById(req.userid).select("language");
    res.status(200).json({ language: foundUser?.language || "en" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ── Mask helpers ──────────────────────────────────────────────────────────────
function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
  if (phone.length <= 4) return phone;
  return `${"*".repeat(phone.length - 4)}${phone.slice(-4)}`;
}