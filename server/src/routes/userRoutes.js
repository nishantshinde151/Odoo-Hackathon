import express from 'express';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  changePassword, 
  deleteUser 
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Protect all routes under user management to authenticated ADMIN users
router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/password', changePassword);
router.delete('/:id', deleteUser);

export default router;
