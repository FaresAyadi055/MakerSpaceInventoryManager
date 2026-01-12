import pool from '../db/pool.js'

class ComplexServices {
    async getPurchaselist() {
        try {
            const [rows] = await pool.query(`SELECT 
    i.id,
    i.model,
    i.description,
    i.quantity AS stock,
    COALESCE(r.request_count, 0) AS request_count,
    COALESCE(r.total_requested, 0) AS total_requested,
    i.\`location\`,
    CASE 
        WHEN COALESCE(r.total_requested, 0) > i.quantity 
        THEN COALESCE(r.total_requested, 0) - i.quantity 
        ELSE 0 
    END AS needed_to_purchase
FROM inventory i
INNER JOIN (
    SELECT 
        model_id,
        COUNT(*) AS request_count,
        SUM(quantity) AS total_requested
    FROM \`requests\`
    GROUP BY model_id
) r ON i.id = r.model_id
ORDER BY needed_to_purchase DESC, i.id ASC;
`);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Error getting logs:', error);
            return { success: false, error: 'Database error' };
        }
    }
}

export default new ComplexServices();
