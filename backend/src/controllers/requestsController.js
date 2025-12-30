import RequestsService from '../services/requestsService.js';
import pool from '../db/pool.js';

class RequestsController {
    // Get all requests
    async getAllRequests(req, res) {
        try {
            const result = await RequestsService.getAllRequests();
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                data: result.data
            });
        } catch (error) {
            console.error('Controller error - getAllRequests:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async getRequestById(req, res) {
        try {
            const { id } = req.params;
            const result = await RequestsService.getRequestById(id);
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
            console.error('Controller error - getRequestById:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async createRequest(req, res) {
        try {
            const result = await RequestsService.createRequest(req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.status(201).json({
                success: true,
                message: 'Request created successfully',
                data: result.data
            });
        } catch (error) {
            console.error('Controller error - createRequest:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async deleteRequest(req, res) {
        try {
            const { id } = req.params;
            const result = await RequestsService.deleteRequest(id);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Request deleted successfully'
            });
        } catch (error) {
            console.error('Controller error - deleteRequest:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async updateRequest(req, res) {
        try {
            const { id } = req.params;
            const result = await RequestsService.updateRequest(id, req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Request updated successfully'
            });
        } catch (error) {
            console.error('Controller error - updateRequest:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
export default new RequestsController();