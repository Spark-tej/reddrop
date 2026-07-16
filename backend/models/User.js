import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Optional so existing email-based registrations remain valid. Test and
    // future registrations can still use a unique username.
    username: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    bloodType: { type: String, required: true, trim: true },
    role: { type: String, enum: ["Donor", "Admin"], default: "Donor" },
    location: {
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
    },
    phone: { type: String, required: true, trim: true },
    lastDonationDate: { type: Date },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
