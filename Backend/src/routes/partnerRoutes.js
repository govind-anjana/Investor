
import express from "express";
import { getAllPartners, getMyReferredInvestors, partnerLogin, partnerSignup } from "../controllers/partnerController.js";
const router = express.Router();
router.post("/signup", partnerSignup);
router.post("/login", partnerLogin);


router.get("/AllPartners",getAllPartners);



router.get("/dashboard/investors",getMyReferredInvestors)
export default router;

// import express from 'express';
// import { acceptDeed, approvePartner, assignReferral, getAllPartners, signup, verifyOtp } from '../controllers/partnerController.js';
// import { login } from '../controllers/adminController.js';

// import { verifyAdmin } from '../middleware/admin.js';
// const router = express.Router();

// router.post('/signup', signup);

// router.post('/verify-otp', verifyOtp);

// router.post('/accept-deed', acceptDeed);

// router.post('/login', login);

// router.get("/partners", verifyAdmin, getAllPartners);
// router.put("/partner/approve/:id", verifyAdmin, approvePartner);
// router.put("/assign-referral", verifyAdmin, assignReferral);


// export default router;