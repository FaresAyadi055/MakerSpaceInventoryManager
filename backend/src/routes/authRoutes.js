// src/routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/magic/request-otp', authController.requestMagicOTP);
router.post('/magic/verify-otp', authController.verifyMagicOTP);

// Magic token verification (for production)
router.post('/magic/verify', authController.verifyMagicLogin);



export default router;