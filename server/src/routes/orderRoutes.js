import express from 'express';
import { getOrders, createOrder, updateOrder, updateOrderStatus, deleteOrder, getOrderById } from '../controllers/orderController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);
router.post('/', authMiddleware, createOrder);
router.put('/:id', authMiddleware, updateOrder);
router.patch('/:id/status', authMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, deleteOrder);

export default router;
