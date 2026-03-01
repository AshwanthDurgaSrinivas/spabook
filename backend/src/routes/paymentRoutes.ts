import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getPayments,
    getPaymentById,
    createPayment,
    getMyPayments,
    getMyPaymentStats
} from '../controllers/paymentController';
import { getRazorpayKeyId, createOrder, verifyPayment } from '../controllers/settingsController';

const router = express.Router();

router.use(authenticateJWT);

router.get('/my', getMyPayments);
router.get('/my-stats', getMyPaymentStats);
router.get('/', authorizeRoles('admin', 'manager', 'receptionist'), getPayments);
router.get('/key', getRazorpayKeyId); // Public-ish (needs auth but basic user ok)
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;
