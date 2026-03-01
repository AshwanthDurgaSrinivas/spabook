import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware';
import {
    getJobPostings,
    getJobPostingById,
    createJobPosting,
    updateJobPosting,
    deleteJobPosting,
    submitJobApplication,
    getJobApplications,
    getJobApplicationById,
    updateJobApplicationStatus,
    deleteJobApplication
} from '../controllers/careerController';

const router = express.Router();

// Public Routes (Accessible on careers page)
router.get('/jobs', getJobPostings);   // Assuming anyone can see open jobs
router.get('/jobs/:id', getJobPostingById);
router.post('/apply', submitJobApplication); // Anyone can apply

// Protected Admin Routes for Job Postings
router.post('/jobs', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), createJobPosting);
router.put('/jobs/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), updateJobPosting);
router.delete('/jobs/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), deleteJobPosting);

// Protected Admin Routes for Job Applications
router.get('/applications', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), getJobApplications);
router.get('/applications/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), getJobApplicationById);
router.put('/applications/:id/status', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), updateJobApplicationStatus);
router.delete('/applications/:id', authenticateJWT, authorizeRoles('admin', 'manager', 'super_admin'), deleteJobApplication);

export default router;
