import express from "express";
import { invertorLogin, investorSignup } from "../controllers/investorController.js";
const router = express.Router();
router.post("/signup", investorSignup);

router.post("/login", invertorLogin);

export default router;
