// src/routes/partnerRoutes.js
import express from "express";
import { getAllPartners, getMyReferredInvestors, getSpecificPartners, partnerLogin, partnerSignup, updatePersonalInfo } from "../controllers/partnerController.js";
import { verifyPartner } from "../middleware/partnerAuth.js";


const router = express.Router();
router.post("/signup", partnerSignup);
router.post("/login", partnerLogin);

// router.post('/verify-otp', verifyOtp);


router.get("/partner/AllPartners",getAllPartners);



router.get("/partner/dashboard/investors",verifyPartner,getMyReferredInvestors);

router.put("/partner/:id",updatePersonalInfo);

router.get("/partner/:id", getSpecificPartners);
export default router;
