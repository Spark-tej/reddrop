import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

const testUsers = [
  ["Rupa", "rupa01", "rupa@test.com", "A+"],
  ["Vishu Teja", "vishuteja01", "vishuteja@test.com", "B+"],
  ["Phani Deep", "phanideep01", "phanideep@test.com", "O+"],
  ["Chaitanya", "chaitanya01", "chaitanya@test.com", "AB+"],
  ["Chandu", "chandu01", "chandu@test.com", "A-"],
  ["Sirisha", "sirisha01", "sirisha@test.com", "B-"],
  ["Sri Sai Teja", "srisaiteja01", "srisaiteja@test.com", "O-"],
  ["Sonali", "sonali01", "sonali@test.com", "AB-"],
  ["Nikhil", "nikhil01", "nikhil@test.com", "A+"],
  ["Sivaram", "sivaram01", "sivaram@test.com", "B+"],
  ["Madhucan", "madhucan01", "madhucan@test.com", "O+"],
].map(([name, username, email, bloodType], index) => ({
  name,
  username,
  email,
  bloodType,
  password: "Test@123",
  phone: `90000000${String(index + 1).padStart(2, "0")}`,
  location: { city: "Hyderabad", state: "Telangana" },
  role: "Donor",
  isAvailable: true,
  isVerified: true,
  banned: false,
}));

if (!uri) {
  console.error("MONGODB_URI or MONGO_URI must be set in backend/.env.");
  process.exit(1);
}

try {
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || undefined });
  const { default: User } = await import("../models/User.js");

  const results = [];
  for (const details of testUsers) {
    let user = await User.findOne({ email: details.email });
    const action = user ? "updated" : "created";

    if (!user) {
      user = new User(details);
    } else {
      Object.assign(user, details);
    }

    await user.save();
    const canLogin = await user.comparePassword(details.password);
    results.push({ name: user.name, username: user.username, email: user.email, bloodType: user.bloodType, action, canLogin });
  }

  console.table(results);
  if (results.some((user) => !user.canLogin)) {
    throw new Error("Password verification failed for one or more test users.");
  }
} catch (error) {
  console.error("Unable to seed test users:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
