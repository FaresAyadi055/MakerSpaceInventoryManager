import LogsService from '../services/logsServices.js';
import pool from '../db/pool.js';

class LogsController {
    // Get all logs
    async getAllLogs(req, res) {
        try {
            const result = await LogsService.getAllLogs();
            if (!result.success) {
                return res.status(result.status || 500).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                data: result.data
            });
        } catch (error) {
            console.error('Controller error - getAllLogs:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getLogById(req, res) {
        try {
            const { id } = req.params;
            const result = await LogsService.getLogById(id);
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
            console.error('Controller error - getLogById:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async createLogEntry(req, res) {
        try {
            const result = await LogsService.createLogEntry(req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.status(201).json({
                success: true,
                message: 'Log entry created successfully',
                data: result.data
            });
        } catch (error) {
            console.error('Controller error - createLogEntry:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async deleteLog(req, res) {
        try {
            const { id } = req.params;
            const result = await LogsService.deleteLog(id);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Log entry deleted successfully'
            });
        } catch (error) {
            console.error('Controller error - deleteLog:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async updateLog(req, res) {
        try {
            const { id } = req.params;
            const result = await LogsService.updateLog(id, req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Log entry updated successfully'
            });
        } catch (error) {
            console.error('Controller error - updateLog:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
export default new LogsController();