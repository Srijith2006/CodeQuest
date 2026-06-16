/**
 * Send an email via Brevo's HTTPS REST API.
 *
 * FIX: Render's free tier blocks outbound SMTP connections entirely
 * (port 465 and 587), regardless of IPv4/IPv6 — this is standard
 * anti-spam policy on most free hosting platforms. No amount of DNS
 * or socket-level fixing can get around a fully blocked port.
 *
 * The real fix is to stop using raw SMTP and instead call an email
 * provider's HTTPS API (port 443), which is never blocked. Brevo lets
 * you send to ANY recipient once you verify a single sender email
 * address — no domain ownership required, unlike Resend's sandbox mode.
 *
 * @param {Object} options
 * @param {string} options.to - recipient email address
 * @param {string} options.subject - email subject line
 * @param {string} options.html - email HTML body
 */
export async function sendEmail({ to, subject, html }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "Code-Quest Security",
        email: process.env.BREVO_SENDER_EMAIL, // must be the verified sender in your Brevo account
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || `Brevo API request failed with status ${response.status}`
    );
  }
}