import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from '../controllers/couponController';
import {
    createCampaign,
    getCampaigns,
    deleteCampaign,
    getTemplates,
    createTemplate,
    getAutomations,
    createAutomation
} from '../controllers/marketingController';
const router = express.Router();

// Coupons
router.post('/coupons', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), createCoupon);
router.get('/coupons', authenticateJWT, getCoupons);
router.put('/coupons/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateCoupon);
router.delete('/coupons/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteCoupon);
router.post('/coupons/validate', authenticateJWT, validateCoupon);

// Campaigns
router.get('/campaigns', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getCampaigns);
router.post('/campaigns', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), createCampaign);
router.delete('/campaigns/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteCampaign);

// Templates
router.get('/templates', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getTemplates);
router.post('/templates', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), createTemplate);

// Automations
router.get('/automations', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), getAutomations);
router.post('/automations', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), createAutomation);

export default router;
