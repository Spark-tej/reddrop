import asyncHandler from "express-async-handler";
import DonationDrive from "../models/DonationDrive.js";

export const createDrive = asyncHandler(async (req, res) => {
  const { title, organizer, date, time, venue, city, description } = req.body;

  const drive = await DonationDrive.create({
    title,
    organizer,
    date,
    time,
    venue,
    city,
    description,
  });

  res.status(201).json({ drive });
});

export const getActiveDrives = asyncHandler(async (req, res) => {
  const today = new Date();
  const drives = await DonationDrive.find({ date: { $gte: today } }).sort({ date: 1 });
  res.json({ drives });
});
