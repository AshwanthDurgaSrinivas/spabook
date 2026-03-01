import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getBookings,
    getBookingById,
    createBooking,
    updateBookingStatus,
    updateBooking,
    resendConfirmation,
    verifyBooking,
    getServiceAvailability,
    requestReschedule,
    requestCancellation,
    handleRescheduleRequest,
    handleCancellationRequest
} from '../controllers/bookingController';

const router = express.Router();

router.use(authenticateJWT); // All booking routes require auth

router.get('/availability', getServiceAvailability); // capacity check — must be before /:id
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking); // Customers can book too? Yes.
router.get('/verify/:id', authorizeRoles('admin', 'manager', 'receptionist', 'therapist', 'employee'), verifyBooking);
router.post('/:id/resend-confirmation', authorizeRoles('admin', 'manager', 'receptionist', 'therapist', 'employee'), resendConfirmation);
router.patch('/:id/status', authorizeRoles('admin', 'manager', 'receptionist', 'therapist', 'employee', 'customer'), updateBookingStatus);
router.put('/:id', authorizeRoles('admin', 'manager', 'receptionist'), updateBooking); // Full update

// Reschedule & Cancellation requests
router.post('/:id/request-reschedule', authorizeRoles('customer', 'admin', 'manager', 'receptionist'), requestReschedule);
router.post('/:id/request-cancellation', authorizeRoles('customer', 'admin', 'manager', 'receptionist'), requestCancellation);
router.post('/:id/handle-reschedule', authorizeRoles('admin', 'manager', 'receptionist'), handleRescheduleRequest);
router.post('/:id/handle-cancellation', authorizeRoles('admin', 'manager', 'receptionist'), handleCancellationRequest);

export default router;
