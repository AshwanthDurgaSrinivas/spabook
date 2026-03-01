import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getMemberships,
    getMembershipById,
    createMembership,
    updateMembership,
    assignMembership,
    getMyMembership,
    getAllSubscriptions,
    deleteMembership,
    subscribeToPlan,
    createMembershipOrder,
    verifyMembershipPayment,
    cancelMyMembership
} from '../controllers/membershipController';

const router = express.Router();

// Membership Plans
router.get('/', getMemberships);
router.get('/:id', getMembershipById);
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager'), createMembership);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateMembership);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteMembership);

// Subscriptions
router.post('/assign', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), assignMembership);
router.post('/subscribe', authenticateJWT, subscribeToPlan);
router.post('/create-order', authenticateJWT, createMembershipOrder);
router.post('/verify-payment', authenticateJWT, verifyMembershipPayment);
router.get('/my/subscription', authenticateJWT, getMyMembership);
router.post('/cancel', authenticateJWT, cancelMyMembership);
router.get('/all/subscriptions', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getAllSubscriptions);

export default router;
