import asyncHandler from "express-async-handler";
import BloodRequest from "../models/BloodRequest.js";

export const createRequest = asyncHandler(async (req, res) => {
  const { patientName, bloodType, unitsRequired, hospitalName, city, urgency, requiredByDate, contactPerson } = req.body;

  const request = await BloodRequest.create({
    requesterId: req.user._id,
    patientName,
    bloodType,
    unitsRequired,
    hospitalName,
    city,
    urgency,
    requiredByDate,
    contactPerson,
  });

  res.status(201).json({ request });
});

export const getAllRequests = asyncHandler(async (req, res) => {
  const { bloodType, city, status, urgency } = req.query;
  const filter = {};

  if (bloodType) filter.bloodType = bloodType;
  if (city) filter.city = new RegExp(city, "i");
  if (status) filter.status = status;
  if (urgency) filter.urgency = urgency;

  const requests = await BloodRequest.find(filter).sort({ createdAt: -1 });
  res.json({ requests });
});

export const getMyRequests = asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({ requesterId: req.user._id }).sort({ createdAt: -1 });
  res.json({ requests });
});

export const updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const request = await BloodRequest.findById(id);
  if (!request) {
    res.status(404);
    throw new Error("Request not found.");
  }
  if (!request.requesterId.equals(req.user._id) && req.user.role !== "Admin") {
    res.status(403);
    throw new Error("Not authorized to update this request.");
  }

  request.status = status;
  await request.save();
  res.json({ request });
});
