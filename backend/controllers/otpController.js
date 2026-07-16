import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendMail } from "../utils/mailer.js";

const OTP_TTL_MS = 60 * 1000; // 1 minute
const RESEND_DELAY_MS = 15 * 1000; // 15 seconds
const MAX_RESEND = 3;
const MAX_ATTEMPTS = 5;
const isOtpDemoMode = () => process.env.OTP_DEMO_MODE === "true";

const generateOtpCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendRegisterOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Invalid request");
  }

  // prevent multiple active OTPs
  await Otp.updateMany({ email, type: "register", used: false, expiresAt: { $lt: new Date() } }, { used: true });

  const existing = await Otp.findOne({ email, type: "register", used: false }).sort({ createdAt: -1 });
  if (existing) {
    const since = Date.now() - new Date(existing.createdAt).getTime();
    if (existing.resendCount >= MAX_RESEND) {
      res.status(429);
      throw new Error("Too many resend attempts");
    }
    if (since < RESEND_DELAY_MS) {
      res.status(429);
      throw new Error("Please wait before resending OTP");
    }
  }

  const code = generateOtpCode();
  const otpHash = await bcrypt.hash(code, Number(process.env.BCRYPT_SALT_ROUNDS || 10));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  const otp = await Otp.create({ email, otpHash, type: "register", expiresAt, resendCount: existing ? existing.resendCount + 1 : 0 });

  console.log(`OTP create attempt for ${email}: id=${otp._id}`);

  // send email (best-effort)
  try {
    res.json({
      message: "OTP sent",
      // Show only the first code in demo mode. Any resend is delivered by
      // email only, so the normal delivery flow can be tested afterwards.
      ...(isOtpDemoMode() && !existing ? { demoCode: code } : {}),
    });

    await sendMail({
      to: email,
      subject: "Your RedDrop registration OTP",
      text: `Your verification code is ${code}. It expires in 1 minute.`,
      html: `<p>Your RedDrop verification code is <strong>${code}</strong>. It expires in 1 minute.</p>`,
    });
  } catch (err) {
    console.warn("Email send failed", err.message);
  }


});

export const verifyRegisterOtp = asyncHandler(async (req, res) => {
  const { email, code, payload } = req.body;
  if (!email || !code || !payload) {
    res.status(400);
    throw new Error("Invalid request");
  }

  const otp = await Otp.findOne({ email, type: "register", used: false }).sort({ createdAt: -1 });
  if (!otp) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    otp.used = true;
    await otp.save();
    res.status(429);
    throw new Error("Too many attempts");
  }
  if (new Date() > otp.expiresAt) {
    otp.used = true;
    await otp.save();
    res.status(400);
    throw new Error("OTP expired");
  }

  const match = await bcrypt.compare(code, otp.otpHash);
  otp.attempts += 1;
  if (!match) {
    await otp.save();
    res.status(400);
    throw new Error("Invalid OTP");
  }

  // create user now (payload contains registration form data)
  const exists = await User.findOne({ email });
  if (exists) {
    otp.used = true;
    await otp.save();
    res.status(400);
    throw new Error("Email already registered");
  }

  const user = await User.create({ ...payload, email });
  otp.used = true;
  await otp.save();

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

  res.status(201).json({ user, token });
});

export const sendResetOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error("Invalid request");
  }

  // Always respond success-like to avoid revealing registered emails
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "OTP sent" });
  }

  // Determine whether this is the first active reset code. A resend creates
  // a new code but does not return it in demo mode.
  const existing = await Otp.findOne({
    email,
    type: "reset",
    used: false,
    expiresAt: { $gte: new Date() },
  }).sort({ createdAt: -1 });

  // invalidate previous reset OTPs
  await Otp.updateMany({ email, type: "reset", used: false }, { used: true });

  const code = generateOtpCode();
  const otpHash = await bcrypt.hash(code, Number(process.env.BCRYPT_SALT_ROUNDS || 10));
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await Otp.create({ email, otpHash, type: "reset", expiresAt, resendCount: 0 });

  try {
    await sendMail({
      to: email,
      subject: "Your RedDrop password reset code",
      text: `Your password reset code is ${code}. It expires in 1 minute.`,
      html: `<p>Your password reset code is <strong>${code}</strong>. It expires in 1 minute.</p>`,
    });
  } catch (err) {
    console.warn("Email send failed", err.message);
  }

  res.json({
    message: "OTP sent",
    // First code only in demo mode; later requests are email-only.
    ...(isOtpDemoMode() && !existing ? { demoCode: code } : {}),
  });
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400);
    throw new Error("Invalid request");
  }

  const otp = await Otp.findOne({ email, type: "reset", used: false }).sort({ createdAt: -1 });
  if (!otp) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }
  if (otp.attempts >= MAX_ATTEMPTS) {
    otp.used = true;
    await otp.save();
    res.status(429);
    throw new Error("Too many attempts");
  }
  if (new Date() > otp.expiresAt) {
    otp.used = true;
    await otp.save();
    res.status(400);
    throw new Error("OTP expired");
  }

  const match = await bcrypt.compare(code, otp.otpHash);
  otp.attempts += 1;
  if (!match) {
    await otp.save();
    res.status(400);
    throw new Error("Invalid OTP");
  }

  otp.used = true;
  await otp.save();

  // indicate success — frontend can allow password reset
  res.json({ message: "OTP verified" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("Invalid request");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("Invalid request");
  }

  user.password = password;
  await user.save();

  res.json({ message: "Password updated" });
});
