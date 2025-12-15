import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema(
  {
    // Basic Info
    name: String,
    email: String,
    phone: { type: String, unique: true },
    password: String,

    // Referral (tracking only)
    referralCodeUsed: {
      type: String,
      default: null,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      default: null,
    },

    // OTP
    otp: String,
    otpExpiresAt: Date,
    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    // Digital Deed
    deedSignature: String,
    deedAcceptedAt: Date,

    // Status
    status: {
      type: String,
      enum: ["OTP_PENDING", "DEED_PENDING", "ACTIVE"],
      default: "OTP_PENDING",
    },

    // Admin approval
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);
