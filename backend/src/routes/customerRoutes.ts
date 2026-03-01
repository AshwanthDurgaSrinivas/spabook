import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
} from '../controllers/customerController';

const router = express.Router();

// Only Admins/Managers can manage customers directly via API?
// Or Employees too?
// For now admin/manager
router.use(authenticateJWT);

// GET routes allow staff (filtered in controller)
router.get('/', authorizeRoles('admin', 'manager', 'receptionist', 'employee', 'therapist'), getCustomers);
router.get('/:id', authorizeRoles('admin', 'manager', 'receptionist', 'employee', 'therapist'), getCustomerById);

// POST/PUT restricted to management
router.post('/', authorizeRoles('admin', 'manager', 'receptionist'), createCustomer);
router.put('/:id', authorizeRoles('admin', 'manager', 'receptionist'), updateCustomer);
router.delete('/:id', authorizeRoles('admin', 'manager'), deleteCustomer);

export default router;
