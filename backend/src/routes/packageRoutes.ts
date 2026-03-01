
import { Router } from 'express';
import {
    getPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage
} from '../controllers/packageController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', getPackages);
router.get('/:id', getPackageById);

// Admin/Manager routes
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), createPackage);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), updatePackage);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deletePackage);

export default router;
