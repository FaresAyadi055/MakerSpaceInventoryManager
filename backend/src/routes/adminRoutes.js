import express from "express";
import adminController from "../controllers/adminController.js";
import {
  authenticate,
  requireAdmin
} from "../middlewares/auth.js";

const router = express.Router();

// GET /api/admins - Get all admins
router.get("/", authenticate, requireAdmin, adminController.getAllAdmins);

// GET /api/admins/:id - Get single admin
router.get("/:id", authenticate, requireAdmin, adminController.getAdminById);

// POST /api/admins - Create new admin
router.post("/", authenticate, requireAdmin, adminController.createAdmin);

// PUT /api/admins/:id - Update admin
router.put("/:id", authenticate, requireAdmin, adminController.updateAdmin);

// DELETE /api/admins/:id - Delete admin
router.delete("/:id", authenticate, requireAdmin, adminController.deleteAdmin);

export default router;