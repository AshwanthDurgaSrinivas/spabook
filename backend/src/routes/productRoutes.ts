import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController';

const router = express.Router();

router.get('/', authenticateJWT, getProducts);
router.get('/:id', authenticateJWT, getProductById);
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager'), createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), updateProduct);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), deleteProduct);

export default router;
