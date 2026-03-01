import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getNotifications,
    createNotification,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController';

const router = express.Router();

router.use(authenticateJWT);

router.get('/', getNotifications);
router.post('/', authorizeRoles('admin', 'manager'), createNotification);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
