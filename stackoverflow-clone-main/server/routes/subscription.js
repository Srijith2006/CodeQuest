import express2 from "express";
import auth from "../middleware/auth.js";
import { createOrder, verifyPayment, getSubscriptionStatus } from "../controller/subscription.js";
const subRouter = express2.Router();
subRouter.post("/create-order", auth, createOrder);
subRouter.post("/verify", auth, verifyPayment);
subRouter.get("/status", auth, getSubscriptionStatus);
export const subscriptionRoutes = subRouter;