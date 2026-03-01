import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getCategories,
    createCategory,
    getServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from '../controllers/serviceController';

const router = express.Router();

// Public routes for browsing
router.get('/categories', getCategories);
router.get('/', getServices);
router.get('/:id', getServiceById);

// Protected routes (Admin/Manager only)
router.post('/categories', authenticateJWT, authorizeRoles('admin', 'manager'), createCategory);
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager'), createService);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateService);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteService);

export default router;
