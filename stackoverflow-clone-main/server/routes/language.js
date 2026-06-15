import express4 from "express";
import auth3 from "../middleware/auth.js";
import { requestLanguageOTP, verifyLanguageOTP, getCurrentLanguage } from "../controller/language.js";
const langRouter = express4.Router();
langRouter.post("/request-otp", auth3, requestLanguageOTP);
langRouter.post("/verify-otp", auth3, verifyLanguageOTP);
langRouter.get("/current", auth3, getCurrentLanguage);
export const languageRoutes = langRouter;