import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} from '../controllers/employeeController';

const router = express.Router();

// Publicly visible? Maybe public can view therapists but not details.
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

// Admin/Manager Only
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager'), createEmployee);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateEmployee);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteEmployee);

export default router;
