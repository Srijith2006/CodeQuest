import express from "express";
import {
  Askquestion,
  deletequestion,
  getallquestion,
  votequestion,
} from "../controller/question.js";
import auth from "../middleware/auth.js";
import { checkQuestionLimit } from "../controller/subscription.js";

const router = express.Router();

// FIX: checkQuestionLimit now runs after auth and before Askquestion,
// so the daily posting limit tied to the user's subscription plan is
// actually enforced. Previously this middleware existed but was never
// wired into this route, so the limit had no effect at all.
router.post("/ask", auth, checkQuestionLimit, Askquestion);
router.get("/getallquestion", getallquestion);
router.delete("/delete/:id", auth, deletequestion);
router.patch("/vote/:id", auth, votequestion);

export default router;