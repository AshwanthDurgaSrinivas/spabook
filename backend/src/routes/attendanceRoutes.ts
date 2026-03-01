import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    checkIn,
    checkOut,
    getAttendance,
    getMyAttendance,
    toggleBreak,
    getTodayStatus,
    updateAttendanceStatus
} from '../controllers/attendanceController';

const router = express.Router();

// Role: Employee can check in/out
router.post('/check-in', authenticateJWT, authorizeRoles('employee', 'manager', 'admin', 'receptionist', 'therapist', 'super_admin'), checkIn);
router.post('/check-out', authenticateJWT, authorizeRoles('employee', 'manager', 'admin', 'receptionist', 'therapist', 'super_admin'), checkOut);
router.post('/toggle-break', authenticateJWT, authorizeRoles('employee', 'manager', 'admin', 'receptionist', 'therapist', 'super_admin'), toggleBreak);

// Role: Employee sees their own, Admin/Manager sees all
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist', 'super_admin'), getAttendance);
router.get('/my-attendance', authenticateJWT, authorizeRoles('employee', 'manager', 'admin', 'receptionist', 'therapist', 'super_admin'), getMyAttendance);
router.get('/today-status', authenticateJWT, authorizeRoles('employee', 'manager', 'admin', 'receptionist', 'therapist', 'super_admin'), getTodayStatus);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), updateAttendanceStatus);

export default router;
