import nodemailer from "nodemailer";
import dns from "dns";
import { promisify } from "util";

const resolve4 = promisify(dns.resolve4);

/**
 * Send an email via Gmail SMTP. Works for ANY valid recipient address —
 * no domain verification needed, unlike Resend's sandbox mode.
 *
 * FIX: Render's network has no usable outbound IPv6 route to Google's
 * mail servers. Setting dns.setDefaultResultOrder("ipv4first") and even
 * nodemailer's `family: 4` option were NOT enough — nodemailer resolves
 * the hostname to an IP before applying those settings, and on Render
 * it kept picking an IPv6 (AAAA) address that's unreachable, causing
 * ENETUNREACH errors.
 *
 * The fix: resolve smtp.gmail.com to an IPv4 address ourselves using
 * dns.resolve4() (which only returns A records, never AAAA), then
 * connect directly to that IP literal. We keep the original hostname
 * via `tls.servername` so the TLS certificate still validates correctly.
 *
 * @param {Object} options
 * @param {string} options.to - recipient email address
 * @param {string} options.subject - email subject line
 * @param {string} options.html - email HTML body
 */
export async function sendEmail({ to, subject, html }) {
  let host = "smtp.gmail.com";

  try {
    const addresses = await resolve4("smtp.gmail.com");
    if (addresses && addresses.length > 0) {
      host = addresses[0]; // guaranteed IPv4 literal
    }
  } catch (err) {
    console.error(
      "IPv4 DNS lookup for smtp.gmail.com failed, falling back to hostname:",
      err.message
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port: 465,
    secure: true,
    tls: {
      // Required for TLS certificate validation since `host` above
      // may be a raw IP address rather than the real hostname.
      servername: "smtp.gmail.com",
    },
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // 16-character Gmail App Password (NOT your normal password)
    },
  });

  // nodemailer throws automatically if sending fails — callers can
  // wrap this in try/catch exactly as they did with Resend before.
  await transporter.sendMail({
    from: `"Code-Quest Security" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}