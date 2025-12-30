import pool from '../db/pool.js';

class LogsService {
    async getAllLogs() {
        try {
            const [rows] = await pool.query(` SELECT * FROM logs ORDER BY timestamp DESC `);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting logs:', error);
            return { success: false, error: 'Database error' };
        }
    }


async getLogById(id) {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM logs WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return { success: false, error: 'Log not found', status: 404 };
        }

        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error getting log:', error);
        return { success: false, error: 'Database error' };
    }
}   
async createLogEntry(logData) {
    try {
        const { model_id, student_email, class_name, quantity } = logData;
        const [result] = await pool.query(
            'INSERT INTO logs (model_id, student_email, class, quantity) VALUES (?, ?, ?, ?)',
            [model_id, student_email, class_name, quantity]
        );
        const newLog = {
            id: result.insertId,
            model_id,
            student_email,
            class_name,
            quantity,
            timestamp: new Date()
        };
        return { success: true, data: newLog };
    } catch (error) {
        console.error('Error creating log entry:', error);
        return { success: false, error: 'Database error' };
    }
}
async deleteLog(id) {
    try {
        const [result] = await pool.query(
            'DELETE FROM logs WHERE id = ?',
            [id]
        );        
        if (result.affectedRows === 0) {
            return { success: false, error: 'Log not found', status: 404 };
        }
        return { success: true, message: 'Log deleted successfully' };
    } catch (error) {
        console.error('Error deleting log:', error);
        return { success: false, error: 'Database error' };
    }
}

async updateLog(id, logData) {
    try {
        const { model_id, student_email, class_name, quantity } = logData;        
        const [result] = await pool.query(
            'UPDATE logs SET model_id = ?, student_email = ?, class = ?, quantity = ? WHERE id = ?',
            [model_id, student_email, class_name, quantity, id]            
        );        
        if (result.affectedRows === 0) {
            return { success: false, error: 'Log not found', status: 404 };
        }
        return { success: true, message: 'Log updated successfully' };
        }
    catch (error) {
        console.error('Error updating log:', error);
        return { success: false, error: 'Database error' };
    }
}

}
export default new LogsService();
