import Razorpay from "razorpay";
import crypto from "crypto";
import user from "../models/auth.js";
import question from "../models/question.js";
import nodemailer from "nodemailer";
import dns from "dns";

// Force Node's DNS resolver to prefer IPv4 globally — Render's network has a
// broken/unreachable IPv6 route to Gmail's SMTP servers.
dns.setDefaultResultOrder("ipv4first");

// ── Plan config ───────────────────────────────────────────────────────────────
export const PLANS = {
  free:   { label: "Free",   price: 0,      dailyLimit: 1,        currency: "INR" },
  bronze: { label: "Bronze", price: 10000,  dailyLimit: 5,        currency: "INR" }, // paise
  silver: { label: "Silver", price: 30000,  dailyLimit: 10,       currency: "INR" },
  gold:   { label: "Gold",   price: 100000, dailyLimit: Infinity,  currency: "INR" },
};

// ── FIX: lazy getter so Razorpay is created AFTER dotenv has loaded env vars ──
function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ── Payment window: 10:00 AM – 11:00 AM IST ──────────────────────────────────
function isPaymentWindowOpen() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffset);
  const totalMin = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return totalMin >= 600 && totalMin < 660; // 10:00–10:59 IST
}

async function sendInvoiceEmail(toEmail, userName, plan, orderId, paymentId) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    family: 4,
    connectionTimeout: 10000,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  const planInfo = PLANS[plan];
  const amount = (planInfo.price / 100).toFixed(2);
  const date = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  await transporter.sendMail({
    from: `"Code-Quest" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Invoice – ${planInfo.label} Plan Subscription`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:#1a73e8;color:#fff;padding:24px;">
          <h2 style="margin:0;">Code-Quest Invoice</h2>
          <p style="margin:4px 0 0;">Subscription Confirmation</p>
        </div>
        <div style="padding:24px;">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Thank you for subscribing! Here are your invoice details:</p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px;">
            <tr style="background:#f4f4f4;">
              <td style="padding:10px;font-weight:bold;">Plan</td>
              <td style="padding:10px;">${planInfo.label}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;">Amount Paid</td>
              <td style="padding:10px;">₹${amount}</td>
            </tr>
            <tr style="background:#f4f4f4;">
              <td style="padding:10px;font-weight:bold;">Daily Question Limit</td>
              <td style="padding:10px;">${planInfo.dailyLimit === Infinity ? "Unlimited" : planInfo.dailyLimit}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;">Order ID</td>
              <td style="padding:10px;">${orderId}</td>
            </tr>
            <tr style="background:#f4f4f4;">
              <td style="padding:10px;font-weight:bold;">Payment ID</td>
              <td style="padding:10px;">${paymentId}</td>
            </tr>
            <tr>
              <td style="padding:10px;font-weight:bold;">Date</td>
              <td style="padding:10px;">${date}</td>
            </tr>
          </table>
          <p style="margin-top:24px;color:#555;">Your subscription is valid for 30 days.</p>
          <p style="color:#999;font-size:12px;">Code-Quest Team</p>
        </div>
      </div>
    `,
  });
}

// ── controllers ───────────────────────────────────────────────────────────────

// POST /subscription/create-order
export const createOrder = async (req, res) => {
  if (!isPaymentWindowOpen()) {
    return res.status(403).json({
      message: "Payments are only allowed between 10:00 AM and 11:00 AM IST.",
    });
  }

  const { plan } = req.body;
  if (!PLANS[plan] || plan === "free") {
    return res.status(400).json({ message: "Invalid plan selected" });
  }

  try {
    const razorpay = getRazorpay(); // FIX: create instance here, env vars are loaded by now
    const order = await razorpay.orders.create({
      amount: PLANS[plan].price,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });
    res.status(200).json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create order" });
  }
};

// POST /subscription/verify
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  const userId = req.userid;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const updatedUser = await user.findByIdAndUpdate(
      userId,
      {
        subscription: {
          plan,
          expiresAt,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true }
    );

    await sendInvoiceEmail(
      updatedUser.email,
      updatedUser.name,
      plan,
      razorpay_order_id,
      razorpay_payment_id
    );

    res.status(200).json({ message: "Subscription activated", data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /subscription/status
export const getSubscriptionStatus = async (req, res) => {
  const userId = req.userid;
  try {
    const foundUser = await user.findById(userId).select("subscription name email");
    if (!foundUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ data: foundUser.subscription });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ── Middleware: check daily question limit ────────────────────────────────────
export const checkQuestionLimit = async (req, res, next) => {
  const userId = req.userid;
  try {
    const foundUser = await user.findById(userId);
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const plan = foundUser.subscription?.plan || "free";
    const expiry = foundUser.subscription?.expiresAt;

    const activePlan =
      plan !== "free" && expiry && new Date(expiry) > new Date() ? plan : "free";
    const limit = PLANS[activePlan].dailyLimit;

    if (limit !== Infinity) {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date();   end.setHours(23, 59, 59, 999);
      const todayCount = await question.countDocuments({
        userid: userId,
        askedon: { $gte: start, $lte: end },
      });
      if (todayCount >= limit) {
        return res.status(403).json({
          message: `Your ${PLANS[activePlan].label} plan allows only ${limit} question${limit > 1 ? "s" : ""} per day. Upgrade to post more!`,
        });
      }
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};