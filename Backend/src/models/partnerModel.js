import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String ,required: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date ,default: null},
    gender: { type: String, enum: ["male", "female","other"], default: null },
    address1: { type: String, default: "" },
    address2: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pinCode: { type: String, default: "" },
    panNumber: { type: String, unique: true,sparse: true, default: "" }, 
     // mandatory
    aadharNumber: { type: String, unique: true, sparse: true, default: "" },
    referralCode: { type: String, unique: true }, // own
    rmReferralUsed: { type: String, default: null }, // RM code used

    completProfile: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive","padding"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
