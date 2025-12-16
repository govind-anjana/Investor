import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String ,required: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    
    referralCode: { type: String, unique: true }, // own
    rmReferralUsed: { type: String, default: null }, // RM code used

    isApproved: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive","padding"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
