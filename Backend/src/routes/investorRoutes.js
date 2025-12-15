import express from "express";
import { investorSignup } from "../controllers/investorController.js";
const router = express.Router();
router.post("/signup", investorSignup);

export default router;
