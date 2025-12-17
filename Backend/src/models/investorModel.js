import mongoose from "mongoose";

const investorSchema = new mongoose.Schema(
  {
    //  Auth Basic
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    //  Partner Mapping 
    partnerReferralUsed: { type: String, default: null },

    //  Investor Profile 
    profile: {
      dob: { type: Date },
      gender: { type: String, enum: ["male", "female", "other"] },
      address: {
        state: String,
        city: String,
        pincode: String,
      },

      // KYC
      kycStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      aadharNumber: String,
      panNumber: String,

      // Bank Details
      bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String,
        bankName: String,
      },
    },

    //  Status 
    isActive: { type: Boolean, default: true },
    completProfile: { type: Boolean, default: false },
    role: { type: String, default: "investor" },
  },
  { timestamps: true }
);

export default mongoose.model("Investor", investorSchema);
