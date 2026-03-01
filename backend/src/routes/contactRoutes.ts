
import { Router } from 'express';
import {
    createContact,
    getContacts,
    getContactById,
    updateContactStatus,
    deleteContact
} from '../controllers/contactController';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public route to submit contact form
router.post('/', createContact);

// Admin/Manager routes
router.get('/', authenticateJWT, authorizeRoles('admin', 'manager'), getContacts);
router.get('/:id', authenticateJWT, authorizeRoles('admin', 'manager'), getContactById);
router.put('/:id/status', authenticateJWT, authorizeRoles('admin', 'manager'), updateContactStatus);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteContact);

export default router;
