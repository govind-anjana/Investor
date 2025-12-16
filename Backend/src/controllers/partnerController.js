//controller/partnerController.js
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Partner from "../models/partnerModel.js";
import RM from "../models/RmModel.js";
import { generateReferralCode } from "../utils/referralcode.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Investor from "../models/investorModel.js";

dotenv.config();

export const getSpecificPartners=async(req,res)=>{
   try {
    const { id } = req.params;

    const partner = await Partner.findById(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Partner fetched successfully",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

export const getAllPartners=async(req,res)=>{
  try {
    const partners = await Partner.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "All Partners fetched successfully",
      data: partners,
    });
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
        message: "Invalid password",
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
    const partnerId = req.partner.id; // JWT se aaye hua id   

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

 export const updatePersonalInfo = async (req, res) => {
  try {
    const partnerId = req.params.id;
    //  ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Partner ID",
      });
    }
    //  Existing partner fetch karo
    const existingPartner = await Partner.findById(partnerId);
    if (!existingPartner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    const {
      name,
      email,
      dateOfBirth,
      gender,
      address1,
      address2,
      city,
      state,
      pinCode,
      panNumber,
      aadharNumber,
    } = req.body;

    const errors = [];

    //  Email – sirf tab validate karo jab aaye
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push("Invalid email format");
      }
    }

    //  DOB
    if (dateOfBirth !== undefined) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime()) || dob > new Date()) {
        errors.push("Invalid date of birth");
      }
    }

    //  Gender
    if (gender !== undefined && !["male", "female", "other"].includes(gender)) {
      errors.push("Invalid gender");
    }

    //  Pin code
    if (pinCode !== undefined && !/^[1-9][0-9]{5}$/.test(pinCode)) {
      errors.push("Invalid Pin code");
    }

    //  PAN
    if (panNumber !== undefined) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
        errors.push("Invalid PAN format");
      }
    }

    // Aadhaar
    if (aadharNumber !== undefined) {
      if (!/^[0-9]{12}$/.test(aadharNumber)) {
        errors.push("Invalid Aadhaar number");
      }
    }

    if (errors.length > 0) {
      return res.status(422).json({
        success: false,
        errors,
      });
    }

    //  Update object — fallback to old values
    const updateData = {
      name: name ?? existingPartner.name,
      email: email ?? existingPartner.email,
      dateOfBirth: dateOfBirth ?? existingPartner.dateOfBirth,
      gender: gender ?? existingPartner.gender,
      address1: address1 ?? existingPartner.address1,
      address2: address2 ?? existingPartner.address2,
      city: city ?? existingPartner.city,
      state: state ?? existingPartner.state,
      pinCode: pinCode ?? existingPartner.pinCode,
      panNumber: panNumber ?? existingPartner.panNumber,
      aadharNumber: aadharNumber ?? existingPartner.aadharNumber,
      completProfile: true,
    };

    const partner = await Partner.findByIdAndUpdate(
      partnerId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Personal information updated successfully",
      data: partner,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "PAN or Aadhaar already exists",
      });
    }

    console.error("Update Personal Info Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

 
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

