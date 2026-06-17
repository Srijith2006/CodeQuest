import mongoose from "mongoose";

const articleSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    userposted: { type: String },
    userid: { type: String },
    readTime: { type: Number, default: 1 }, // in minutes, computed automatically at creation
    views: { type: Number, default: 0 },
    likes: { type: [String], default: [] }, // array of userIds who liked this article
  },
  { timestamps: true }
);

export default mongoose.model("article", articleSchema);