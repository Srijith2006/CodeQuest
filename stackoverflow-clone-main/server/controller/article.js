import mongoose from "mongoose";
import article from "../models/article.js";

// ── Estimate read time based on word count (~200 words/min average) ──────────
function calculateReadTime(body) {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// POST /article/create  (auth required)
export const createArticle = async (req, res) => {
  const { title, body, category, tags, userposted } = req.body;
  const userid = req.userid; // set by auth middleware

  if (!title || !body || !category) {
    return res.status(400).json({ message: "Title, body, and category are required" });
  }

  try {
    const readTime = calculateReadTime(body);
    const newArticle = await article.create({
      title,
      body,
      category,
      tags: Array.isArray(tags) ? tags : [],
      userid,
      userposted,
      readTime,
    });
    res.status(200).json({ data: newArticle });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /article/getall
export const getAllArticles = async (req, res) => {
  try {
    const articles = await article.find().sort({ createdAt: -1 });
    res.status(200).json({ data: articles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// GET /article/:id  (also increments the view count)
export const getArticleById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Article unavailable" });
  }
  try {
    const updated = await article.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Article not found" });
    res.status(200).json({ data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// PATCH /article/like/:id  (auth required) — toggles like on/off
export const toggleLike = async (req, res) => {
  const { id } = req.params;
  const userid = req.userid;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Article unavailable" });
  }

  try {
    const found = await article.findById(id);
    if (!found) return res.status(404).json({ message: "Article not found" });

    const alreadyLiked = found.likes.includes(userid);
    const updated = await article.findByIdAndUpdate(
      id,
      alreadyLiked ? { $pull: { likes: userid } } : { $addToSet: { likes: userid } },
      { new: true }
    );
    res.status(200).json({ data: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// DELETE /article/:id  (auth required, owner only)
export const deleteArticle = async (req, res) => {
  const { id } = req.params;
  const userid = req.userid;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Article unavailable" });
  }

  try {
    const found = await article.findById(id);
    if (!found) return res.status(404).json({ message: "Article not found" });

    if (found.userid !== userid) {
      return res.status(403).json({ message: "You can only delete your own articles" });
    }

    await article.findByIdAndDelete(id);
    res.status(200).json({ message: "Article deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};