import nodemailer from "nodemailer";
import dns from "dns";

// Render's network has a broken/unreliable IPv6 route to Gmail's SMTP
// servers. Forcing IPv4 resolution globally fixes ETIMEDOUT/connection
// errors when sending mail from a Render-hosted server.
dns.setDefaultResultOrder("ipv4first");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // 16-character Gmail App Password (NOT your normal password)
      },
    });
  }
  return transporter;
}

/**
 * Send an email via Gmail SMTP. Works for ANY valid recipient address —
 * no domain verification needed, unlike Resend's sandbox mode.
 *
 * @param {Object} options
 * @param {string} options.to - recipient email address
 * @param {string} options.subject - email subject line
 * @param {string} options.html - email HTML body
 */
export async function sendEmail({ to, subject, html }) {
  const mailTransporter = getTransporter();
  // nodemailer throws automatically if sending fails — callers can
  // wrap this in try/catch exactly as they did with Resend before.
  await mailTransporter.sendMail({
    from: `"Code-Quest Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}