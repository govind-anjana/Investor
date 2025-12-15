// controllers/rmController.js
import bcrypt from "bcryptjs";
import RM from "../models/RmModel.js";
import { generateReferralCode } from "../utils/referralcode.js";

export const createRM = async (req, res) => {
  const rm = await RM.create({
    name: req.body.name,
    phone: req.body.phone,
    password: await bcrypt.hash(req.body.password, 10),
    referralCode: generateReferralCode("RM"),
  });

  res.json({ success: true, rm });
};
