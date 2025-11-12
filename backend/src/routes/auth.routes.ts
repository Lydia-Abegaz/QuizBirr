import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Public routes
router.post('/send-otp', rateLimit({ windowMs: 60000, maxRequests: 3 }), (req, res) => authController.sendOTP(req, res));
router.post('/verify-otp', rateLimit({ windowMs: 60000, maxRequests: 5 }), (req, res) => authController.verifyOTP(req, res));

// Protected routes
router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res));

export default router;
