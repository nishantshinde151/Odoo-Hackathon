import express from 'express';
import { getOrders, createOrder, updateOrderStatus } from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getOrders);
router.post('/', authMiddleware, createOrder);
router.patch('/:id/status', authMiddleware, updateOrderStatus);

export default router;
