import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getTiers,
    createTier,
    updateTier,
    deleteTier,
    getMyLoyalty,
    getCustomerLoyalty,
    getAllCustomerLoyalty,
    adjustPoints,
    getTransactions
} from '../controllers/loyaltyController';

const router = express.Router();

// Tiers Management (Admin)
router.get('/tiers', getTiers);
router.post('/tiers', authenticateJWT, authorizeRoles('admin', 'manager'), createTier);
router.put('/tiers/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateTier);
router.delete('/tiers/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteTier);

// Customer Side
router.get('/me', authenticateJWT, getMyLoyalty);

// Admin View
router.get('/all', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getAllCustomerLoyalty);
router.get('/transactions', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getTransactions);
router.get('/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getCustomerLoyalty);
router.post('/:id/adjust', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), adjustPoints);

export default router;
