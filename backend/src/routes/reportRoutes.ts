import { Router } from 'express';
import { getReports, createReport, deleteReport } from '../controllers/reportController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getReports);
router.post('/', createReport);
router.delete('/:id', authorizeRoles('admin'), deleteReport);

export default router;
