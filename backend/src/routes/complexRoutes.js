import express from "express";
import ComplexController from '../controllers/complexController.js';
import {
  authenticate,
  requireAdmin
} from "../middlewares/auth.js";


const router = express.Router();

// GET /api/complex - Get all complex items
router.get("/", authenticate, requireAdmin, ComplexController.getPurchaselist);

// GET /api/complex/optimized - Get optimized purchase list

export default router;
