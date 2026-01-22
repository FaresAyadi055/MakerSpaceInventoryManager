// src/controllers/inventoryController.js
import inventoryService from '../services/inventoryService.js';
import pool from '../db/pool.js';
import jwt from 'jsonwebtoken';
async function checkIfAdmin(authHeader) {
  try {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return false;
    
    try {
      // Decode JWT without verification first to check structure
      const decoded = jwt.decode(token);
      
      if (decoded && decoded.role === 'admin') {
        // If role is in token, use it
        return true;
      }
      
      // If no role in token, verify and check admin table
      const verified = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key');
      const email = verified.email;
      
      const [admins] = await pool.query(
        'SELECT id FROM admins WHERE email = ?',
        [email]
      );
      
      return admins.length > 0;
      
    } catch (jwtError) {
      // If JWT fails, it might be old email token
      console.log('JWT failed, trying as plain email');
      
      // Check if token looks like an email
      if (token.includes('@')) {
        const [admins] = await pool.query(
          'SELECT id FROM admins WHERE email = ?',
          [token]
        );
        return admins.length > 0;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}
class InventoryController {
  // Get all inventory items
  async getAllInventory(req, res) {
    try {
      // Check if user is admin via token (if provided)
      const isAdmin = await checkIfAdmin(req.headers.authorization);
      
      let query;
      if (isAdmin) {
        query = 'SELECT id, model, description, quantity, location, link FROM inventory ORDER BY id DESC';
      } else {
        query = 'SELECT id, model, description, quantity, link FROM inventory ORDER BY id DESC';
      }
      
      const [rows] = await pool.query(query);
      
      res.json({
        success: true,
        count: rows.length,
        data: rows,
        includesLocation: isAdmin
      });
    } catch (error) {
      console.error('Error getting inventory:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch inventory'
      });
    }
  }

  // Get single inventory item
  async getInventoryItem(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID'
        });
      }
      
      const result = await inventoryService.getInventoryById(parseInt(id));
      
      if (!result.success) {
        return res.status(result.status || 404).json({
          success: false,
          message: result.error
        });
      }
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Controller error - getInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Create new inventory item
  async createInventoryItem(req, res) {
    try {
      const result = await inventoryService.createInventoryItem(req.body);
      
      if (!result.success) {
        return res.status(result.status || 400).json({
          success: false,
          message: result.error
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Item created successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Controller error - createInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Update inventory item
  async updateInventoryItem(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID'
        });
      }
      
      const result = await inventoryService.updateInventoryItem(
        parseInt(id), 
        req.body
      );
      
      if (!result.success) {
        return res.status(result.status || 400).json({
          success: false,
          message: result.error
        });
      }
      
      res.json({
        success: true,
        message: 'Item updated successfully',
        data: result.data
      });
    } catch (error) {
      console.error('Controller error - updateInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Delete inventory item
  async deleteInventoryItem(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item ID'
        });
      }
      
      const result = await inventoryService.deleteInventoryItem(parseInt(id));
      
      if (!result.success) {
        return res.status(result.status || 400).json({
          success: false,
          message: result.error
        });
      }
      
      res.json({
        success: true,
        message: result.message || 'Item deleted successfully'
      });
    } catch (error) {
      console.error('Controller error - deleteInventoryItem:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Search inventory
  async searchInventory(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }
      
      const result = await inventoryService.searchInventory(q.trim());
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error
        });
      }
      
      res.json({
        success: true,
        count: result.data.length,
        data: result.data
      });
    } catch (error) {
      console.error('Controller error - searchInventory:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // Get inventory statistics
  async getInventoryStats(req, res) {
    try {
      const result = await inventoryService.getInventoryStats();
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error
        });
      }
      
      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      console.error('Controller error - getInventoryStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new InventoryController();