import adminService from '../services/adminService.js';

class AdminController {
    // Get all admins
    async getAllAdmins(req, res) {
        try {
            const result = await adminService.getAllAdmins();
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
            console.error('Controller error - getAllAdmins:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async getAdminById(req, res) {
        try {
            const { id } = req.params;
            const result = await adminService.getAdminById(id);
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
            console.error('Controller error - getAdminById:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async createAdmin(req, res) {
        try {
            const result = await adminService.createAdmin(req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.status(201).json({
                success: true,
                message: 'Admin created successfully',
                data: result.data
            });
        } catch (error) {
            console.error('Controller error - createAdmin:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async deleteAdmin(req, res) {
        try {
            const { id } = req.params;
            const result = await adminService.deleteAdmin(id);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Admin deleted successfully'
            });
        } catch (error) {
            console.error('Controller error - deleteAdmin:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
    async updateAdmin(req, res) {
        try {
            const { id } = req.params;
            const result = await adminService.updateAdmin(id, req.body);
            if (!result.success) {
                return res.status(result.status || 400).json({
                    success: false,
                    message: result.error
                });
            }
            res.json({
                success: true,
                message: result.message || 'Admin updated successfully'
            });
        } catch (error) {
            console.error('Controller error - updateAdmin:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
export default new AdminController();