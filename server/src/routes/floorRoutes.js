import express from 'express';
import { getAllFloors, createFloor, updateFloor, deleteFloor } from '../controllers/floorController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllFloors);
router.post('/', authMiddleware, roleMiddleware('ADMIN'), createFloor);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN'), updateFloor);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), deleteFloor);

export default router;
