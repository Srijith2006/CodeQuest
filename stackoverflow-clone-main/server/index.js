import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import questionroute from "./routes/question.js";
import answerroutes from "./routes/answer.js";
import friendroutes from "./routes/friend.js";
import postroutes from "./routes/post.js";
import { subscriptionRoutes } from "./routes/subscription.js";
import { rewardRoutes } from "./routes/reward.js";
import { languageRoutes } from "./routes/language.js";
import { forgotPasswordRoutes } from "./routes/forgotpassword.js";

const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});

app.use("/user", userroutes);
app.use("/question", questionroute);
app.use("/answer", answerroutes);
app.use("/post", postroutes);
app.use("/friends", friendroutes);
app.use("/subscription", subscriptionRoutes);
app.use("/rewards", rewardRoutes);
app.use("/language", languageRoutes);
app.use("/forgotpassword", forgotPasswordRoutes);

const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

mongoose
  .connect(databaseurl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
