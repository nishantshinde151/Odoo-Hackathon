import express from 'express';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createCategory);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteCategory);

export default router;
