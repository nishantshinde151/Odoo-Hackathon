import express from 'express';
import { getActivePromotions } from '../controllers/promotionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getActivePromotions);

export default router;
