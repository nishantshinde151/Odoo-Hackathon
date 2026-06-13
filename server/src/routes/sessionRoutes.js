import express from 'express';
import { 
  getAllSessions, 
  getActiveSession, 
  openSession, 
  closeSession, 
  getSessionSummary 
} from '../controllers/sessionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllSessions);
router.get('/active', authMiddleware, getActiveSession);
router.post('/open', authMiddleware, openSession);
router.post('/close', authMiddleware, closeSession);
router.get('/:id/summary', authMiddleware, getSessionSummary);

export default router;
