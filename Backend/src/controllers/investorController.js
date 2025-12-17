// controllers/investorController.js
import bcrypt from "bcryptjs";
import Investor from "../models/investorModel.js";
import Partner from "../models/partnerModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const investorSignup = async (req, res) => {
  try {
    const { name, email, phone, password, partnerReferralUsed } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    // Partner referral validation
    if (partnerReferralUsed) {
      const partner = await Partner.findOne({ referralCode: partnerReferralUsed });
      if (!partner) {
        return res.status(400).json({
          success: false,
          message: "Invalid partner referral code",
        });
      }
    }
    // Duplicate check
    const existingInvestor = await Investor.findOne({ phone });
    
    if (existingInvestor) {
      return res.status(409).json({
        success: false,
        message: "Investor already exists with this phone",
      });
    }

    // Password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create investor
    const investor = await Investor.create({
      name,
      email,
      phone,
      password: hashedPassword,
      partnerReferralUsed: partnerReferralUsed || null,
    });

    res.status(201).json({
      success: true,
      message: "Investor registered successfully",
      investor: {
        id: investor._id,
        name: investor.name,
        email: investor.email,
        phone: investor.phone,
        partnerReferralUsed: investor.partnerReferralUsed,
        createdAt: investor.createdAt,
      },
    });
  } catch (error) {
    console.error("Investor Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const invertorLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    //  Required fields
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required",
      });
    }

    //  Find investor
    const investor = await Investor.findOne({ phone });
      if (!investor) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (!investorSignup) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    //  Password check
    const isMatch = await bcrypt.compare(password, investor.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }


    // Generate JWT
    const token = jwt.sign(
      { id: investor._id, role: "investor" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      investor: {
        id: investor._id,
        name: investor.name,
        phone: investor.phone,
        referralCode: investor.referralCode,
      },
    });
  } catch (error) {
    console.error("investor Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }


}

export const signDigitalDeed = async (req, res) => {
  
}

// export const investorSignup = async (req, res) => {
//   const investor = await Investor.create({
//     name: req.body.name,
//     phone: req.body.phone,
//     password: await bcrypt.hash(req.body.password, 10),

//     investorReferralUsed: req.body.investorReferralCode || null,
//   });

//   res.json({ success: true, investor });
// };
