import ComplexService from '../services/complexService.js';
import pool from '../db/pool.js';

class ComplexController{
    async getPurchaselist(req, res) {
        try {
            const result = await ComplexService.getPurchaselist();
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
            console.error('Controller error - getPurchaselist:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

}

export default new ComplexController();
