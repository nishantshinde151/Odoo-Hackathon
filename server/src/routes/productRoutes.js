import express from 'express';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createProduct);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateProduct);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteProduct);

export default router;
