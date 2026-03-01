import express from 'express';
import { getTaxes, createTax, updateTax, deleteTax, getPublicTaxes } from '../controllers/taxController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/public', getPublicTaxes);

// Admin routes
router.get('/', authenticateJWT, authorizeRoles('admin'), getTaxes);
router.post('/', authenticateJWT, authorizeRoles('admin'), createTax);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), updateTax);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteTax);

export default router;
