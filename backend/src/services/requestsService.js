import pool from '../db/pool.js';
class RequestsService {
    async getAllRequests() {
        try {
            const [rows] = await pool.query(` SELECT r.id, i.model, r.model_id, r.student_email, r.class, r.quantity, r.timestamp FROM requests r JOIN inventory i ON r.model_id = i.id ORDER BY timestamp DESC `);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting requests:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async getRequestById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM requests WHERE id = ?',
                [id]
            );
            if (rows.length === 0) {
                return { success: false, error: 'Request not found', status: 404 };
            }
            return { success: true, data: rows[0] };
        } catch (error) {
            console.error('Error getting request:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async getRequestsByStudentEmail(student_email) {
        try {
            const [rows] = await pool.query(
                'SELECT r.id, r.model_id, i.model, r.student_email, r.class, r.quantity, r.timestamp FROM requests r JOIN inventory i ON r.model_id = i.id WHERE r.student_email = ? ORDER BY r.timestamp ASC;',
                [student_email]
            );
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting requests:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async createRequest(requestData) {
        try {
            const { model_id, student_email, class_name, quantity } = requestData;
            const [result] = await pool.query(
                'INSERT INTO requests (model_id, student_email, class, quantity) VALUES (?, ?, ?, ?)',
                [model_id,   student_email, class_name, quantity]
            );
            const newRequest = {
                id: result.insertId,
                model_id,
                student_email,
                class_name,
                quantity,
                timestamp: new Date()
            };
            return { success: true, data: newRequest };
        } catch (error) {
            console.error('Error creating request:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async deleteRequest(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM requests WHERE id = ?',
                [id]
            );
            if (result.affectedRows === 0) {
                return { success: false, error: 'Request not found', status: 404 };
            }
            return { success: true, message: 'Request deleted successfully' };
        } catch (error) {
            console.error('Error deleting request:', error);
            return { success: false, error: 'Database error' };
        }
    }
    async updateRequest(id, updateData) {
        try {
            const fields = [];
            const values = [];
            for (const field in updateData) {
                fields.push(`${field} = ?`);
                values.push(updateData[field]);
            }
            const [result] = await pool.query(
                `UPDATE requests SET ${fields.join(', ')} WHERE id = ?`,
                [...values, id]
            );
            if (result.affectedRows === 0) {
                return { success: false, error: 'Request not found', status: 404 };
            }
            return { success: true, message: 'Request updated successfully' };
        } catch (error) {
            console.error('Error updating request:', error);
            return { success: false, error: 'Database error' };
        }
    }
}
export default new RequestsService();