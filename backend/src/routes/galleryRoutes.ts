import { Router } from 'express';
import { getGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../controllers/galleryController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public route
router.get('/', getGalleryItems);

// Protected routes
router.post('/', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), createGalleryItem);
router.put('/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), updateGalleryItem);
router.delete('/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'receptionist'), deleteGalleryItem);

export default router;
