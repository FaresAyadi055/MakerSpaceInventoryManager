import express from "express";
import RequestsController from "../controllers/requestsController.js";
import { 
  authenticate,    
  requireRole,        
  requireAdmin,        
  requireStudent      
} from '../middlewares/auth.js'; 

const router = express.Router();

// Create a new request
router.post("/", authenticate, RequestsController.createRequest);

// Get all requests
router.get("/", authenticate,requireAdmin, RequestsController.getAllRequests);

// Get a specific request by ID
router.get("/:id", authenticate,requireAdmin, RequestsController.getRequestById);  

// Update a request by ID
router.put("/:id",authenticate,requireAdmin, RequestsController.updateRequest);

// Delete a request by ID
router.delete("/:id", authenticate,requireAdmin, RequestsController.deleteRequest);

export default router;