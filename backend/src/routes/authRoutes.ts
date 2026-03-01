import express from 'express';
import { login, register, getCurrentUser, changePassword, updateProfile } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';
import User from '../models/User';
import passport from '../config/passport';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateJWT, getCurrentUser);
router.post('/change-password', authenticateJWT, changePassword);
router.put('/profile', authenticateJWT, updateProfile);

// Social Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // On success, redirect to dashboard with a token or just session
    // Since we use JWT for other things, we might want to generate a JWT here
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/success?type=social`);
});

export default router;
