import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = mongoose.Schema(
  {
    caption: { type: String, default: "" },
    mediaUrl: { type: String, required: true },   // base64 data-url or cloud URL
    mediaType: { type: String, enum: ["image", "video"], required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    likes: { type: [String], default: [] },        // array of userIds
    comments: { type: [commentSchema], default: [] },
    shares: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("post", postSchema);