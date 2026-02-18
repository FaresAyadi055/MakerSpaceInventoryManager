import express from 'express';
import LogsController from '../controllers/logsController.js';
import { 
  authenticate,    
  requireRole,        
  requireAdmin,        
  requireStudent      
} from '../middlewares/auth.js';   
const router = express.Router();
// GET /api/logs - Get all logs
router.get('/', authenticate, requireAdmin, LogsController.getAllLogs);

// GET /api/logs/:id - Get single log
router.get('/:id', authenticate, requireAdmin, LogsController.getLogById);

// POST /api/logs - Create new log
router.post('/',authenticate,requireAdmin, LogsController.createLogEntry);

// PUT /api/logs/:id - Update log
router.put('/:id', authenticate, requireAdmin, LogsController.updateLog);
// DELETE /api/logs/:id - Delete log
router.delete('/:id', authenticate, requireAdmin, LogsController.deleteLog);

// GET /api/logs/student/:student_email - Get logs for a specific student
router.get('/student/:student_email', authenticate, LogsController.getLogsByStudentEmail);

export default router;