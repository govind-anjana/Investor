import mongoose from "mongoose";

const investorSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, unique: true },
    password: String,

    partnerReferralUsed: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Investor", investorSchema);
