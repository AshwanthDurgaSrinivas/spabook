import { Router } from 'express';
import { getDashboardStats, getServicePerformance, getEmployeePerformance } from '../controllers/analyticsController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/dashboard', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getDashboardStats);
router.get('/services', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getServicePerformance);
router.get('/employees', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getEmployeePerformance);

export default router;
