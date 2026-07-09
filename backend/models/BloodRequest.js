import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    patientName: { type: String, required: true, trim: true },
    bloodType: { type: String, required: true, trim: true },
    unitsRequired: { type: Number, required: true, min: 1 },
    hospitalName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    urgency: { type: String, enum: ["Urgent", "Normal"], default: "Normal" },
    status: { type: String, enum: ["Open", "Fulfilled", "Expired"], default: "Open" },
    requiredByDate: { type: Date },
    contactPerson: { type: String, trim: true },
  },
  { timestamps: true }
);

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);
export default BloodRequest;
