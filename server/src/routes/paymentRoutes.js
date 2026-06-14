import express from 'express';
import { processPayment, getPaymentMethods, sendEmailReceipt } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/charge', authMiddleware, processPayment);
router.get('/methods', authMiddleware, getPaymentMethods);
router.post('/:orderId/email', authMiddleware, sendEmailReceipt);

export default router;
