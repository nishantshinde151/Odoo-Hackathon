import express from 'express';
import { getAllTables, createTable, updateTable, deleteTable } from '../controllers/tableController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllTables);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createTable);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateTable);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteTable);

export default router;
