import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import { createDrive, getActiveDrives } from "../controllers/driveController.js";

const router = express.Router();

router.post("/create", protect, adminOnly, createDrive);
router.get("/active", getActiveDrives);

export default router;
