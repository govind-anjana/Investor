import express from 'express';
import { login, SignUpAdmin } from '../controllers/adminController.js';
import { createRM } from '../controllers/rmController.js';
import { createCommission } from '../controllers/commissionController.js';
const router = express.Router();    

router.post('/signup', SignUpAdmin);
router.post('/login',login);
router.post("/rm", createRM);
router.post("/commission", createCommission);
export default router;