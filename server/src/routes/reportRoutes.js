import express from 'express';
import { getSalesReport } from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/sales', authMiddleware, roleMiddleware('ADMIN'), getSalesReport);

export default router;
