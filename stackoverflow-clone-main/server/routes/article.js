import express from "express";
import {
  createArticle,
  getAllArticles,
  getArticleById,
  toggleLike,
  deleteArticle,
} from "../controller/article.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/create", auth, createArticle);
router.get("/getall", getAllArticles);
router.get("/:id", getArticleById);
router.patch("/like/:id", auth, toggleLike);
router.delete("/:id", auth, deleteArticle);

export default router;