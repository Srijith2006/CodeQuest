import express from "express";
import auth from "../middleware/auth.js";
import {
  Signup,
  Login,
  verifyLoginOTP,
  getallusers,
  updateprofile,
  getLoginHistory,
} from "../controller/auth.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/verify-login-otp", verifyLoginOTP);
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
router.get("/login-history", auth, getLoginHistory);

export default router;