import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    updateLeaveStatus
} from '../controllers/leaveController';

const router = express.Router();

router.post('/apply', authenticateJWT, applyLeave);
router.get('/my-leaves', authenticateJWT, getMyLeaves);
router.get('/all', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getAllLeaves);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager'), updateLeaveStatus);

export default router;
