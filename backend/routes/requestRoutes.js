import express from "express";
import { protect } from "../middleware/auth.js";
import { createRequest, getAllRequests, getMyRequests, updateRequestStatus } from "../controllers/requestController.js";

const router = express.Router();

router.post("/create", protect, createRequest);
router.get("/all", getAllRequests);
router.get("/my-requests", protect, getMyRequests);
router.put("/status/:id", protect, updateRequestStatus);

export default router;
