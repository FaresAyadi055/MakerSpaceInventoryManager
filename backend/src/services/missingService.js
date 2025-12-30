import pool from '../db/pool.js';

class MissingService {
    async getAllMissing() {
        try {
            const [rows] = await pool.query(` SELECT * FROM missing ORDER BY timestamp DESC `);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting missing items:', error);
            return { success: false, error: 'Database error' };
        }
    }


async getMissingById(id) {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM missing WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return { success: false, error: 'Missing item not found', status: 404 };
        }

        return { success: true, data: rows[0] };
    } catch (error) {
        console.error('Error getting missing item:', error);
        return { success: false, error: 'Database error' };
    }
}   
async createMissingEntry(missingData) {
    try {
        const { model_description, student_email, class_name, quantity } = missingData;
        const [result] = await pool.query(
            'INSERT INTO missing (model, student_email, class, quantity) VALUES (?, ?, ?, ?)',
            [model_description, student_email, class_name, quantity]
        );
        const newMissing = {
            id: result.insertId,
            model_description,
            student_email,
            class_name,
            quantity,
            timestamp: new Date()
        };
        return { success: true, data: newMissing };
    } catch (error) {
        console.error('Error creating missing entry:', error);
        return { success: false, error: 'Database error' };
    }
}
async deleteMissing(id) {
    try {
        const [result] = await pool.query(
            'DELETE FROM missing WHERE id = ?',
            [id]
        );        
        if (result.affectedRows === 0) {
            return { success: false, error: 'Missing item not found', status: 404 };
        }
        return { success: true, message: 'Missing item deleted successfully' };
    } catch (error) {
        console.error('Error deleting missing item:', error);
        return { success: false, error: 'Database error' };
    }
}

async updateMissing(id, missingData) {
    try {
        const { model, student_email, class_name, quantity } = missingData;        
        const [result] = await pool.query(
            'UPDATE missing SET model = ?, student_email = ?, class = ?, quantity = ? WHERE id = ?',
            [model, student_email, class_name, quantity, id]            
        );        
        if (result.affectedRows === 0) {
            return { success: false, error: 'Missing item not found', status: 404 };
        }
        return { success: true, message: 'Missing item updated successfully' };
        }
    catch (error) {
        console.error('Error updating missing item:', error);
        return { success: false, error: 'Database error' };
    }
}

}
export default new MissingService();
