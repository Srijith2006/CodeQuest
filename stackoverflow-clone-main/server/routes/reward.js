import express3 from "express";
import auth2 from "../middleware/auth.js";
import { getLeaderboard, getMyPoints, transferPoints } from "../controller/rewards.js";
const rewardRouter = express3.Router();
rewardRouter.get("/leaderboard", getLeaderboard);
rewardRouter.get("/mypoints", auth2, getMyPoints);
rewardRouter.post("/transfer", auth2, transferPoints);
export const rewardRoutes = rewardRouter;