// controllers/investorController.js
import bcrypt from "bcryptjs";
import Investor from "../models/investorModel.js";

export const investorSignup = async (req, res) => {
  const investor = await Investor.create({
    name: req.body.name,
    phone: req.body.phone,
    password: await bcrypt.hash(req.body.password, 10),

    partnerReferralUsed: req.body.partnerReferralCode || null,
  });

  res.json({ success: true, investor });
};
