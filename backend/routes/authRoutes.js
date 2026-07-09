import express from "express";
import { registerUser, loginUser, getCurrentUser } from "../controllers/authController.js";
import { sendRegisterOtp, verifyRegisterOtp, sendResetOtp, verifyResetOtp, resetPassword } from "../controllers/otpController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Existing registration/login routes are preserved for backward compatibility.
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getCurrentUser);

// OTP-based registration and password reset flows
router.post("/send-register-otp", sendRegisterOtp);
router.post("/verify-register-otp", verifyRegisterOtp);

router.post("/send-reset-otp", sendResetOtp);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

export default router;
