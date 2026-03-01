
import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getFAQs,
    adminGetFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    createTicket,
    getCustomerTickets,
    getAllTickets,
    updateTicket
} from '../controllers/helpController';

const router = express.Router();

// Public/Customer Routes
router.get('/faqs', getFAQs);
router.post('/tickets', authenticateJWT, createTicket);
router.get('/tickets/my', authenticateJWT, getCustomerTickets);

// Admin Routes
router.use(authenticateJWT);
router.use(authorizeRoles('admin', 'manager', 'super_admin'));

router.get('/admin/faqs', adminGetFAQs);
router.post('/faqs', createFAQ);
router.put('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

router.get('/admin/tickets', getAllTickets);
router.put('/tickets/:id', updateTicket);

export default router;
