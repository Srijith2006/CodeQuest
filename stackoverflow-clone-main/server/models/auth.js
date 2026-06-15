import mongoose from "mongoose";

const loginHistorySchema = mongoose.Schema({
  browser: { type: String },
  os: { type: String },
  device: { type: String },
  ipAddress: { type: String },
  loginAt: { type: Date, default: Date.now },
});

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },

  // Social Space (existing)
  friends: { type: [String], default: [] },
  friendRequests: { type: [String], default: [] },

  // Feature 1 – Forgot Password
  forgotPasswordUsedAt: { type: Date, default: null },
  phone: { type: String, default: "" },

  // Feature 2 – Subscription
  subscription: {
    plan: { type: String, enum: ["free", "bronze", "silver", "gold"], default: "free" },
    expiresAt: { type: Date, default: null },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
  },

  // Feature 3 – Reward Points
  points: { type: Number, default: 0 },

  // Feature 4 – Language
  language: { type: String, default: "en" },
  languageOtpCode: { type: String, default: "" },
  languageOtpExpiry: { type: Date, default: null },

  // Feature 5 – Login History
  loginHistory: { type: [loginHistorySchema], default: [] },
});

export default mongoose.model("user", userschema);