import mongoose from "mongoose";

const rmSchema = new mongoose.Schema(
  {
    name: String,
    phone: { type: String, unique: true },
    password: String,

    referralCode: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("RM", rmSchema);
