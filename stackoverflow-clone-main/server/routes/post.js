import express from "express";
import {
  getAllPosts,
  createPost,
  likePost,
  commentOnPost,
  sharePost,
  deletePost,
} from "../controller/post.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/getallposts", getAllPosts);
router.post("/create", auth, createPost);
router.patch("/like/:id", auth, likePost);
router.post("/comment/:id", auth, commentOnPost);
router.patch("/share/:id", sharePost);
router.delete("/:id", auth, deletePost);

export default router;