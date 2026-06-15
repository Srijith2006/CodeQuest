import mongoose from "mongoose";

const questionschema = mongoose.Schema(
  {
    questiontitle: { type: String, required: true },
    questionbody: { type: String, required: true },
    questiontags: { type: [String], required: true },
    noofanswer: { type: Number, default: 0 },
    upvote: { type: [String], default: [] },
    downvote: { type: [String], default: [] },
    userposted: { type: String },
    userid: { type: String },
    askedon: { type: Date, default: Date.now },
    answer: [
      {
        answerbody: String,
        useranswered: String,
        userid: String,
        answeredon: { type: Date, default: Date.now },
        // ── NEW: per-answer voting (required for +5 bonus at 5 upvotes) ──────
        upvote: { type: [String], default: [] },
        downvote: { type: [String], default: [] },
        // Tracks whether the 5-upvote bonus has already been awarded,
        // so it's only ever given once per answer.
        bonusAwarded: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("question", questionschema);