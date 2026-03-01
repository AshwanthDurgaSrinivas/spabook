
import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import { getSettings, updateSetting, getPublicSettings, testSMTPConnection } from '../controllers/settingsController';

const router = express.Router();

router.get('/public', getPublicSettings);
router.post('/test-smtp', testSMTPConnection);

router.use(authenticateJWT);
router.use(authorizeRoles('admin'));

router.get('/', getSettings);
router.post('/', updateSetting);

export default router;
