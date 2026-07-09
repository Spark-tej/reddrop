import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken, { attachAuthCookie } from "../middleware/auth.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, bloodType, location, phone, lastDonationDate } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("Email is already registered.");
  }

  const user = await User.create({
    name,
    email,
    password,
    bloodType,
    location,
    phone,
    lastDonationDate: lastDonationDate || null,
    role: "Donor",
  });

  const token = generateToken(user);
  attachAuthCookie(res, token);

  res.status(201).json({ user, token });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  if (user.banned) {
    res.status(403);
    throw new Error("Your account is banned. Contact support.");
  }

  const token = generateToken(user);
  attachAuthCookie(res, token);
  res.json({ user, token });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ user });
});
