import pool from '../db/pool.js';

class adminService {
    async getAllAdmins() {
        try {
            const [rows] = await pool.query('SELECT * FROM admins');
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting admins:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async getAdminById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM admins WHERE id = ?',
                [id]
            );
            if (rows.length === 0) {
                return { success: false, error: 'Admin not found', status: 404 };
            }
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Error getting admins:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async createAdmin(adminData) {
        try {
            const { email, password_hash } = adminData;
            const [result] = await pool.query(
                'INSERT INTO admins (email) VALUES (?)',
                [ email]
            );
            return { success: true, data: { id: result.insertId, ...adminData } };
        } catch (error) {
            console.error('Error creating admin:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async deleteAdmin(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM admins WHERE id = ?',
                [id]
            );            
            if (result.affectedRows === 0) {
                return { success: false, error: 'Admin not found', status: 404 };
            }
            return { success: true, message: 'Admin deleted successfully' };
        } catch (error) {
            console.error('Error deleting admin:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async updateAdmin(id, adminData) {
        try {
            const { email, password_hash } = adminData;
            const [result] = await pool.query(
                'UPDATE admins SET email = ? WHERE id = ?',
                [email, id]
            );            
            if (result.affectedRows === 0) {
                return { success: false, error: 'Admin not found', status: 404 };
            }
            return { success: true, message: 'Admin updated successfully' };
        } catch (error) {
            console.error('Error updating admin:', error);
            return { success: false, error: 'Database error' };
        }
    }
}   
export default new adminService();