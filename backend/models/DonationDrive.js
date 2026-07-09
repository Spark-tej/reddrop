import mongoose from "mongoose";

const donationDriveSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    organizer: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const DonationDrive = mongoose.model("DonationDrive", donationDriveSchema);
export default DonationDrive;
