import express from 'express';
import { processPayment, getPaymentMethods } from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/charge', authMiddleware, processPayment);
router.get('/methods', authMiddleware, getPaymentMethods);

export default router;
