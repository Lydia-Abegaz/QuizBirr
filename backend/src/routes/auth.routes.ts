import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();

// Public routes
router.post('/send-otp', rateLimit({ windowMs: 60000, maxRequests: 3 }), authController.sendOTP.bind(authController));
router.post('/verify-otp', rateLimit({ windowMs: 60000, maxRequests: 5 }), authController.verifyOTP.bind(authController));

// Protected routes
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;
