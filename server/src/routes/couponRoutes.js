import express from 'express';
import { validateCoupon } from '../controllers/couponController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/validate', authMiddleware, validateCoupon);

export default router;
