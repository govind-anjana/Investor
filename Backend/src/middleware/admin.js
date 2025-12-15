import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";
export const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token)
      return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    req.admin = admin; // optional
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};