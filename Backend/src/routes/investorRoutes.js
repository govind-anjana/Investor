import express from "express";
import { invertorLogin, investorSignup, signDigitalDeed } from "../controllers/investorController.js";
import upload from "../middleware/upload.js";
const router = express.Router();
router.post("/signup", investorSignup);

router.post("/login", invertorLogin);

router.post("/digital-deed",upload.single("signature"), signDigitalDeed);

export default router;
