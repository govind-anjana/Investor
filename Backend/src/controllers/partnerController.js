//controller/partnerController.js
import bcrypt from "bcryptjs";
import Partner from "../models/partnerModel.js";
import RM from "../models/RmModel.js";
import { generateReferralCode } from "../utils/referralcode.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Investor from "../models/investorModel.js";

dotenv.config();


export const getAllPartners=async(req,res)=>{
  try {
    const partners = await Partner.find({}).sort({ createdAt: -1 });
    return res.json(partners);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}
// Helper regex
const phoneRegex = /^[6-9]\d{9}$/;

export const partnerSignup = async (req, res) => {
  try {
    const { name, email, phone, password, rmReferralCode } = req.body;

    //  Required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  
    //  Phone validation
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    //  Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    //  Duplicate partner check
    const exists = await Partner.findOne({ phone });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Partner already registered with this phone",
      });
    }

    //  RM referral code validation (optional)
    if (rmReferralCode) {
      const rmExists = await RM.findOne({ referralCode: rmReferralCode });
      if (!rmExists) {
        return res.status(400).json({
          success: false,
          message: "Invalid RM referral code",
        });
      }
    }

    //  Create partner
    const partner = await Partner.create({
      name,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      referralCode: generateReferralCode("PT"),
      rmReferralUsed: rmReferralCode || null,
    });

    res.status(201).json({
      success: true,
      message: "Partner registered successfully",
      partner,
    });
  } catch (error) {
    console.error("Partner Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const partnerLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    //  Required fields
    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Phone and password are required",
      });
    }

    //  Find partner
    const partner = await Partner.findOne({ phone });
    if (!partner) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    //  Password check
    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone or password",
      });
    }

    //  (Optional) approval check
    // if (!partner.isApproved) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Account pending admin approval",
    //   });
    // }

    // Generate JWT
    const token = jwt.sign(
      { id: partner._id, role: "partner" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      partner: {
        id: partner._id,
        name: partner.name,
        phone: partner.phone,
        referralCode: partner.referralCode,
      },
    });
  } catch (error) {
    console.error("Partner Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const getMyReferredInvestors = async (req, res) => {
  try {
    const partnerId = req.partner.id; // JWT se aayega

    //  Get logged-in partner
    const partner = await Partner.findById(partnerId);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    //  Find investors who used this partner's referral code
    const investors = await Investor.find({
      partnerReferralUsed: partner.referralCode,
    }).select("-password"); // password hide

    res.status(200).json({
      success: true,
      count: investors.length,
      investors,
    });
  } catch (error) {
    console.error("Partner Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// import bcrypt from 'bcryptjs';
// import Partner from '../models/partnerModel.js';

// export const signup = async (req, res) => {
//   const { name, email, phone, password, confirmPassword } = req.body;

//   // Required fields
//   if (!name || !email || !phone || !password || !confirmPassword) {
//     return res.status(400).json({ message: "All fields required" });
//   }

//   // Email format
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!emailRegex.test(email)) {
//     return res.status(400).json({ message: "Invalid email format" });
//   }

//   // Password match
//   if (password !== confirmPassword) {
//     return res.status(400).json({ message: "Passwords do not match" });
//   }

//   // Phone uniqueness
//   const phoneExists = await Partner.findOne({ phone });
//   if (phoneExists) {
//     return res.status(400).json({ message: "Phone already registered" });
//   }

//   // Save temp user (OTP pending)
//   await TempUser.create({
//     name,
//     email,
//     phone,
//     password: await bcrypt.hash(password, 10),
//   });

//   // Send OTP
// //   await sendOtp(phone);

//   res.json({ success: true, message: `OTP sent this number ${phone}` });
// };

// export const verifyOtp = async (req, res) => {
//   const { phone, otp } = req.body;

//   const record = await Partner.findOne({ phone });

//   if (!record || record.otp !== otp) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   // OTP correct → mark verified
//   await TempUser.updateOne({ phone }, { isOtpVerified: true });

//   res.json({
//     success: true,
//     message: "OTP verified",
//     next: "DIGITAL_DEED",
//   });
// };

// export const acceptDeed = async (req, res) => {
//   const { phone, signature, agree } = req.body;

//   if (!agree) {
//     return res.status(400).json({ message: "Deed agreement required" });
//   }

//   if (!signature) {
//     return res.status(400).json({ message: "Signature required" });
//   }

//   const tempUser = await TempUser.findOne({
//     phone,
//     isOtpVerified: true,
//   });

//   if (!tempUser) {
//     return res.status(400).json({ message: "OTP not verified" });
//   }

//   // Create final user
//   const user = await User.create({
//     name: tempUser.name,
//     email: tempUser.email,
//     phone: tempUser.phone,
//     password: tempUser.password,
//     deedAcceptedAt: new Date(),
//     deedSignature: signature,
//     isAdmin: false,
//   });

//   // Cleanup
//   await TempUser.deleteOne({ phone });

//   res.json({
//     success: true,
//     message: "Signup completed",
//     userId: user._id,
//   });
// };


// /* Get all partners */
// export const getAllPartners = async (req, res) => {
//   const partners = await Partner.find().populate("referredBy", "name phone");
//   res.json({ success: true, data: partners });
// };

// /* Approve Partner */
// export const approvePartner = async (req, res) => {
//   const partner = await Partner.findById(req.params.id);

//   if (!partner)
//     return res.status(404).json({ message: "Partner not found" });

//   partner.isApproved = true;
//   partner.status = "ACTIVE";
//   await partner.save();

//   res.json({ success: true, message: "Partner approved" });
// };

// /* Assign Referral (Manual) */
// export const assignReferral = async (req, res) => {
//   const { userId, referredById } = req.body;

//   const user = await Partner.findById(userId);
//   const referrer = await Partner.findById(referredById);

//   if (!user || !referrer)
//     return res.status(404).json({ message: "User not found" });

//   user.referredBy = referrer._id;
//   await user.save();

//   res.json({
//     success: true,
//     message: "Referral assigned successfully",
//   });
// };

