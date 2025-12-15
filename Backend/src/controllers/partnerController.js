import bcrypt from 'bcryptjs';
import Partner from '../models/partnerModel.js';

export const signup = async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  // Required fields
  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Password match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Phone uniqueness
  const phoneExists = await Partner.findOne({ phone });
  if (phoneExists) {
    return res.status(400).json({ message: "Phone already registered" });
  }

  // Save temp user (OTP pending)
  await TempUser.create({
    name,
    email,
    phone,
    password: await bcrypt.hash(password, 10),
  });

  // Send OTP
//   await sendOtp(phone);

  res.json({ success: true, message: `OTP sent this number ${phone}` });
};

export const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  const record = await Partner.findOne({ phone });

  if (!record || record.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // OTP correct → mark verified
  await TempUser.updateOne({ phone }, { isOtpVerified: true });

  res.json({
    success: true,
    message: "OTP verified",
    next: "DIGITAL_DEED",
  });
};

export const acceptDeed = async (req, res) => {
  const { phone, signature, agree } = req.body;

  if (!agree) {
    return res.status(400).json({ message: "Deed agreement required" });
  }

  if (!signature) {
    return res.status(400).json({ message: "Signature required" });
  }

  const tempUser = await TempUser.findOne({
    phone,
    isOtpVerified: true,
  });

  if (!tempUser) {
    return res.status(400).json({ message: "OTP not verified" });
  }

  // Create final user
  const user = await User.create({
    name: tempUser.name,
    email: tempUser.email,
    phone: tempUser.phone,
    password: tempUser.password,
    deedAcceptedAt: new Date(),
    deedSignature: signature,
    isAdmin: false,
  });

  // Cleanup
  await TempUser.deleteOne({ phone });

  res.json({
    success: true,
    message: "Signup completed",
    userId: user._id,
  });
};


/* Get all partners */
export const getAllPartners = async (req, res) => {
  const partners = await Partner.find().populate("referredBy", "name phone");
  res.json({ success: true, data: partners });
};

/* Approve Partner */
export const approvePartner = async (req, res) => {
  const partner = await Partner.findById(req.params.id);

  if (!partner)
    return res.status(404).json({ message: "Partner not found" });

  partner.isApproved = true;
  partner.status = "ACTIVE";
  await partner.save();

  res.json({ success: true, message: "Partner approved" });
};

/* Assign Referral (Manual) */
export const assignReferral = async (req, res) => {
  const { userId, referredById } = req.body;

  const user = await Partner.findById(userId);
  const referrer = await Partner.findById(referredById);

  if (!user || !referrer)
    return res.status(404).json({ message: "User not found" });

  user.referredBy = referrer._id;
  await user.save();

  res.json({
    success: true,
    message: "Referral assigned successfully",
  });
};

