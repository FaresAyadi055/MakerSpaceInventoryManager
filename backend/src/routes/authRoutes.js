// src/routes/authRoutes.js
import express from 'express';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/verify', authenticate, authController.verify);

export default router;