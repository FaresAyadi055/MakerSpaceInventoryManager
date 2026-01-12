// complexRoutes.js - Add these debug routes
import express from "express";
import ComplexController from '../controllers/complexController.js';
import {
  authenticate,
  requireAdmin
} from "../middlewares/auth.js";
import pool from '../db/pool.js'; // Add this import

const router = express.Router();

// Debug endpoint - test the query piece by piece
router.get("/debug", authenticate, requireAdmin, async (req, res) => {
  const results = {};
  
  try {
    console.log("🧪 Starting complex query debug...");
    
    // Test 1: Check if inventory table exists
    try {
      const [invTest] = await pool.query("SELECT COUNT(*) as count FROM inventory");
      results.inventory = { exists: true, count: invTest[0].count };
      console.log("✅ Inventory table exists:", invTest[0].count, "rows");
    } catch (error) {
      results.inventory = { exists: false, error: error.message };
      console.error("❌ Inventory table error:", error.message);
    }
    
    // Test 2: Check if requests table exists (with backticks)
    try {
      const [reqTest] = await pool.query("SELECT COUNT(*) as count FROM \`requests\`");
      results.requests = { exists: true, count: reqTest[0].count };
      console.log("✅ Requests table exists:", reqTest[0].count, "rows");
    } catch (error) {
      results.requests = { exists: false, error: error.message };
      console.error("❌ Requests table error:", error.message);
    }
    
    // Test 3: Test the subquery alone
    try {
      const [subquery] = await pool.query(`
        SELECT 
          model_id,
          COUNT(*) as request_count,
          SUM(quantity) as total_requested
        FROM \`requests\`
        GROUP BY model_id
        LIMIT 5
      `);
      results.subquery = { success: true, data: subquery };
      console.log("✅ Subquery works, found", subquery.length, "model groups");
    } catch (error) {
      results.subquery = { success: false, error: error.message };
      console.error("❌ Subquery failed:", error.message);
    }
    
    // Test 4: Test simple JOIN without WHERE clause
    try {
      const [simpleJoin] = await pool.query(`
        SELECT 
          i.id,
          i.model,
          r.request_count
        FROM inventory i
        LEFT JOIN (
          SELECT model_id, COUNT(*) as request_count
          FROM \`requests\`
          GROUP BY model_id
        ) r ON i.id = r.model_id
        LIMIT 5
      `);
      results.simpleJoin = { success: true, data: simpleJoin };
      console.log("✅ Simple JOIN works");
    } catch (error) {
      results.simpleJoin = { success: false, error: error.message };
      console.error("❌ Simple JOIN failed:", error.message);
    }
    
    // Test 5: Test with WHERE clause
    try {
      const [withWhere] = await pool.query(`
        SELECT 
          i.id,
          i.model,
          r.request_count
        FROM inventory i
        LEFT JOIN (
          SELECT model_id, COUNT(*) as request_count
          FROM \`requests\`
          GROUP BY model_id
        ) r ON i.id = r.model_id
        WHERE r.model_id IS NOT NULL
        LIMIT 5
      `);
      results.withWhere = { success: true, data: withWhere };
      console.log("✅ WHERE clause works");
    } catch (error) {
      results.withWhere = { success: false, error: error.message };
      console.error("❌ WHERE clause failed:", error.message);
    }
    
    res.json({ success: true, debug: results });
    
  } catch (error) {
    console.error("❌ Debug endpoint error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Your existing routes
router.get("/", authenticate, requireAdmin, ComplexController.getPurchaselist);

export default router;
