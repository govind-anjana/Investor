import express from 'express';
import { login, SignUpAdmin } from '../controllers/adminController.js';

const router = express.Router();    

router.post('/signup', SignUpAdmin);
router.post('/login',login);

export default router;