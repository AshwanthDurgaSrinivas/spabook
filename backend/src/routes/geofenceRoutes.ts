import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    getExceptions,
    updateException
} from '../controllers/geofenceController';

const router = express.Router();

router.use(authenticateJWT);
router.use(authorizeRoles('admin', 'manager'));

router.get('/locations', getLocations);
router.post('/locations', createLocation);
router.put('/locations/:id', updateLocation);
router.delete('/locations/:id', deleteLocation);

router.get('/exceptions', getExceptions);
router.put('/exceptions/:employeeId', updateException);

export default router;
