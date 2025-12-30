import MissingController from '../controllers/missingController.js';
import express from 'express';
import { 
  authenticate,    
  requireRole,        
  requireAdmin,        
  requireStudent      
} from '../middlewares/auth.js';
const router = express.Router();

// GET /api/missing - Get all missing items
router.get('/', authenticate, requireAdmin, MissingController.getAllMissing);

// GET /api/missing/:id - Get single missing item
router.get('/:id', authenticate, requireAdmin, MissingController.getMissingById);

// POST /api/missing - Create new missing item
router.post('/', authenticate, MissingController.createMissingEntry);

// PUT /api/missing/:id - Update missing item
router.put('/:id', authenticate, requireAdmin, MissingController.updateMissing);

// DELETE /api/missing/:id - Delete missing item
router.delete('/:id', authenticate, requireAdmin, MissingController.deleteMissing);
export default router;