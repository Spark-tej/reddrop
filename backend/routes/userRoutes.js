import express from "express";
import { getDonors, updateProfile } from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/donors", getDonors);
router.put("/profile", protect, updateProfile);

export default router;
