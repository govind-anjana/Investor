import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/adminModel.js';
import dotenv from "dotenv";

dotenv.config();

export const  login = async (req, res) => {
  try {
    const { username, password } = req.body;
   //  validate request
    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

      // find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    //compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid this password" });

    // generate JWT Token
    const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send Successfully response
    res.status(200).json({ message: "Login successful", token, admin: { id: admin._id, username: admin.username } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const SignUpAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

     // Check if username and password provided
    if (!username || !password)
      return res.status(400).json({ message: "username and password are required" });
     // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin)
      return res.status(400).json({ message: "Admin already exists" });

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

      // Create new admin
    const newAdmin = new Admin({ username, password: hashed });
    await newAdmin.save();

    // Return success response
    res.status(201).json({ message: "Admin created successfully", admin: { id: newAdmin._id, username: newAdmin.username } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};