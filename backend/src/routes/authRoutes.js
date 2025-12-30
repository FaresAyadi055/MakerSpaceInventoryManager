// src/routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authController.requestLoginCode);

// Protected routes (require authentication)
router.post('/verify', authController.verifyLoginCode);


export default router;