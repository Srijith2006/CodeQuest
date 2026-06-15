import express from "express";
import { postanswer, deleteanswer, voteanswer } from "../controller/answer.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/post/:id", auth, postanswer);
router.delete("/delete/:id/:answerId", auth, deleteanswer);
router.patch("/vote/:questionId/:answerId", auth, voteanswer);

export default router;