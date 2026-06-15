import express from "express";
import { forgotPassword } from "../controller/forgotpassword.js";

const router = express.Router();

router.post("/reset", forgotPassword);

export { router as forgotPasswordRoutes };