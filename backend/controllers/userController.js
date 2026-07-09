import asyncHandler from "express-async-handler";
import User from "../models/User.js";

export const getDonors = asyncHandler(async (req, res) => {
  const { bloodType, city } = req.query;
  const filter = { role: "Donor", banned: false, isAvailable: true };

  if (bloodType) filter.bloodType = bloodType;
  if (city) filter["location.city"] = new RegExp(city, "i");

  const donors = await User.find(filter).select("name bloodType location phone isAvailable");
  res.json({ donors });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const { name, phone, bloodType, location, lastDonationDate, isAvailable } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (bloodType) user.bloodType = bloodType;
  if (location) user.location = { ...user.location, ...location };
  if (lastDonationDate !== undefined) user.lastDonationDate = lastDonationDate;
  if (typeof isAvailable === "boolean") user.isAvailable = isAvailable;

  await user.save();
  res.json({ user: user.toJSON() });
});
