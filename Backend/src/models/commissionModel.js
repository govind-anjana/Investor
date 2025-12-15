import mongoose from "mongoose";

const commissionSchema = new mongoose.Schema(
  {
    investor: { type: mongoose.Schema.Types.ObjectId, ref: "Investor" },
    partner: { type: mongoose.Schema.Types.ObjectId, ref: "Partner" },

    investmentAmount: Number,
    partnerCommission: Number,
    adminEarning: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Commission", commissionSchema);
