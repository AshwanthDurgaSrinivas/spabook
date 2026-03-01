import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    provisionAllRooms,
} from '../controllers/roomController';
import {
    getRoomSchedule,
    blockRoomDate,
    unblockRoomDate,
} from '../controllers/roomScheduleController';

const router = express.Router();

router.get('/', authenticateJWT, getRooms);
// provision-all MUST come before /:id to avoid being caught by the param route
router.post('/provision-all', authenticateJWT, authorizeRoles('admin', 'manager'), provisionAllRooms);
router.get('/:id', authenticateJWT, getRoomById);
router.get('/:id/schedule', authenticateJWT, getRoomSchedule);
router.post('/:id/blocks', authenticateJWT, authorizeRoles('admin', 'manager'), blockRoomDate);
router.delete('/:id/blocks/:date', authenticateJWT, authorizeRoles('admin', 'manager'), unblockRoomDate);
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager'), createRoom);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateRoom);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteRoom);

export default router;
