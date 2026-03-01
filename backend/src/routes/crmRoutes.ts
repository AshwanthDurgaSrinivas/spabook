import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import { getCRMAnalytics, executeCampaign, getCustomersBySegment, sendSegmentCampaign, trackEmailOpen, trackEmailClick } from '../controllers/crmController';

const router = express.Router();

// Tracking routes (public)
router.get('/track/open/:campaignId', trackEmailOpen);
router.get('/track/click/:campaignId', trackEmailClick);

router.get('/analytics', authenticateJWT, authorizeRoles('admin', 'manager'), getCRMAnalytics);
router.get('/segments/:segmentValue/customers', authenticateJWT, authorizeRoles('admin', 'manager'), getCustomersBySegment);
router.post('/segments/:segmentValue/campaign', authenticateJWT, authorizeRoles('admin', 'manager'), sendSegmentCampaign);
router.post('/campaigns/:id/send', authenticateJWT, authorizeRoles('admin', 'manager'), executeCampaign);

export default router;
