// src/routes/inventoryRoutes.js
import express from 'express';
import inventoryController from '../controllers/inventoryController.js';
import { 
  authenticate,    
  requireRole,        
  requireAdmin,        
  requireStudent      
} from '../middlewares/auth.js';

const router = express.Router();

// GET /api/inventory - Get all inventory items
router.get('/',authenticate, inventoryController.getAllInventory);

// GET /api/inventory/stats - Get inventory statistics
router.get('/stats', authenticate, inventoryController.getInventoryStats);

// GET /api/inventory/search?q= - Search inventory
router.get('/search', authenticate, inventoryController.searchInventory);

// GET /api/inventory/:id - Get single inventory item
router.get('/:id',authenticate, inventoryController.getInventoryItem);

// POST /api/inventory - Create new inventory item
router.post('/', authenticate, requireAdmin, inventoryController.createInventoryItem);

// PUT /api/inventory/:id - Update inventory item
router.put('/:id', authenticate, requireAdmin, inventoryController.updateInventoryItem);

// DELETE /api/inventory/:id - Delete inventory item
router.delete('/:id', authenticate, requireAdmin, inventoryController.deleteInventoryItem);

export default router;