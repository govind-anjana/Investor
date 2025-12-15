import jwt from "jsonwebtoken";
import Partner from "../models/partnerModel.js";
import dotenv from "dotenv";
dotenv.config();
export const verifyPartner = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const partner = await Partner.findById(decoded.id);

    if (!partner) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.partner = partner; // 👈 important
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
