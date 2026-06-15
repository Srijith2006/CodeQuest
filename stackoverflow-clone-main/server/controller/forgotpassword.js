import user from "../models/auth.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// ── Generate a random password using ONLY uppercase + lowercase letters ──────
// Spec requirement: "must contain only uppercase and lowercase letters,
// with no numbers or special characters"
function generatePassword(length = 10) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const all = upper + lower;
  let pwd = "";
  // Guarantee at least one of each case
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  for (let i = 2; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  // Shuffle so the guaranteed chars aren't always first
  return pwd
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}

// ── Check if forgot-password was already used today (once-per-day limit) ─────
function usedToday(dateField) {
  if (!dateField) return false;
  const last = new Date(dateField);
  const now = new Date();
  return (
    last.getFullYear() === now.getFullYear() &&
    last.getMonth() === now.getMonth() &&
    last.getDate() === now.getDate()
  );
}

// ── Email the new password directly to the user ──────────────────────────────
async function sendPasswordEmail(toEmail, userName, newPassword) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Must be a Gmail App Password
    },
  });

  await transporter.verify();

  await transporter.sendMail({
    from: `"Code-Quest Security" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your New Password – Code-Quest",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#1a73e8,#0d47a1);color:#fff;padding:28px 24px;text-align:center;">
          <h2 style="margin:0;font-size:22px;">Password Reset</h2>
          <p style="margin:6px 0 0;opacity:0.85;font-size:14px;">Code-Quest Security</p>
        </div>
        <div style="padding:28px 24px;">
          <p style="color:#333;font-size:15px;">Hi <strong>${userName || "there"}</strong>,</p>
          <p style="color:#555;font-size:14px;">
            We received a request to reset your password. Your new password is:
          </p>

          <div style="background:#f0f4ff;border:2px dashed #1a73e8;border-radius:12px;
                      padding:20px;text-align:center;margin:20px 0;">
            <p style="margin:0 0 6px;color:#555;font-size:12px;text-transform:uppercase;letter-spacing:1px;">
              New Password
            </p>
            <div style="font-size:28px;font-weight:bold;letter-spacing:3px;color:#1a73e8;font-family:monospace;">
              ${newPassword}
            </div>
          </div>

          <p style="color:#e53935;font-size:13px;">
            ⚠️ For your security, please log in and change this password as soon as possible.
          </p>
          <p style="color:#777;font-size:13px;">
            If you did not request this, please contact support immediately —
            your account may be at risk.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="color:#aaa;font-size:12px;text-align:center;">Code-Quest Security Team</p>
        </div>
      </div>
    `,
  });
}

// ── POST /forgotpassword/reset ─────────────────────────────────────────────
// body: { email } OR { phone }
export const forgotPassword = async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ message: "Email or phone number is required" });
  }

  try {
    let foundUser;
    if (email) {
      foundUser = await user.findOne({ email });
    } else {
      foundUser = await user.findOne({ phone });
    }

    if (!foundUser) {
      return res.status(404).json({ message: "No account found with that email/phone" });
    }

    // ── Once-per-day limit ──────────────────────────────────────────────────
    if (usedToday(foundUser.forgotPasswordUsedAt)) {
      return res.status(429).json({
        message: "You can use this option only one time per day.",
      });
    }

    // ── Generate new password (letters only, no numbers/symbols) ────────────
    const newPassword = generatePassword(10);
    const hashed = await bcrypt.hash(newPassword, 12);

    await user.findByIdAndUpdate(foundUser._id, {
      password: hashed,
      forgotPasswordUsedAt: new Date(),
    });

    if (email) {
      // Send directly to registered email
      try {
        await sendPasswordEmail(foundUser.email, foundUser.name, newPassword);
        return res.status(200).json({
          message: `✅ A new password has been sent to ${foundUser.email}. Please check your inbox.`,
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr.message);
        // Password WAS changed in DB even if email fails — show it as fallback
        return res.status(200).json({
          message: `Password reset successful, but email delivery failed. Your new password is: ${newPassword} (please save this — check EMAIL_PASS in server/.env)`,
        });
      }
    }

    // Phone-based reset — SMS gateway not integrated, return password directly
    // (In production, integrate Twilio/MSG91 to SMS this instead of returning it)
    return res.status(200).json({
      message: `Password reset successful. Your new password is: ${newPassword}`,
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Something went wrong: " + error.message });
  }
};