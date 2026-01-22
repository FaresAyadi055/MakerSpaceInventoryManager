import pool from '../db/pool.js'

class ComplexServices {
    async getPurchaselist() {
        try {
            const [rows] = await pool.query(`SELECT 
    i.id,
    i.model,
    i.description,
    i.quantity as stock,
    COALESCE(r.request_count, 0) as request_count,
    COALESCE(r.total_requested, 0) as total_requested,
    i.\`location\`,
    CASE 
        WHEN COALESCE(r.total_requested, 0) > i.quantity 
        THEN COALESCE(r.total_requested, 0) - i.quantity 
        ELSE 0 
    END as needed_to_purchase
FROM inventory i
LEFT JOIN (
    SELECT 
        model_id,
        COUNT(*) as request_count,
        SUM(quantity) as total_requested
    FROM \`requests\`
    GROUP BY model_id
) r ON i.id = r.model_id
WHERE r.model_id IS NOT NULL
ORDER BY needed_to_purchase DESC, i.id ASC;`);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting logs:', error);
            return { success: false, error: 'Database error' };
        }
    }
}

export default new ComplexServices();