import express from "express";
import { getDonors } from "../controllers/userController.js";

const router = express.Router();

// Compatibility route for frontend or external callers using /api/donors.
router.get("/", getDonors);

export default router;
