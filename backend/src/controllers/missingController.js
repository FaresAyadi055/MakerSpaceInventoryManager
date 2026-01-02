import MissingService from '../services/missingService.js';
import pool from '../db/pool.js';

class MissingController {
    // Get all missing items
    async getAllMissing(req, res) {
        try {
            const result = await MissingService.getAllMissing();
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
            console.error('Controller error - getAllMissing:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getMissingById(req, res) {
        try {
            const { id } = req.params;
            const result = await MissingService.getMissingById(id);
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
            console.error('Controller error - getMissingById:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async getMissingByStudentEmail(req, res) {
        try {
            const { student_email } = req.params;
            const result = await MissingService.getMissingByStudentEmail(student_email);
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
            console.error('Controller error - getMissingByStudentEmail:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async createMissingEntry(req, res) {
        try {
            const result = await MissingService.createMissingEntry(req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.status(201).json({
                success: true,
                message: 'Missing entry created successfully',
                data: result.data
            });
        } catch (error) {
            console.error('Controller error - createMissingEntry:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async deleteMissing(req, res) {
        try {
            const { id } = req.params;
            const result = await MissingService.deleteMissing(id);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Missing entry deleted successfully'
            });
        } catch (error) {
            console.error('Controller error - deleteMissing:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async updateMissing(req, res) {
        try {
            const { id } = req.params;
            const result = await MissingService.updateMissing(id, req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Missing entry updated successfully'
            });
        } catch (error) {
            console.error('Controller error - updateMissing:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
export default new MissingController();