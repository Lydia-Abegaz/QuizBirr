import { Router } from 'express';
import { referralController } from '../controllers/referral.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.post('/apply', authenticate, referralController.applyReferralCode.bind(referralController));
router.get('/stats', authenticate, referralController.getReferralStats.bind(referralController));
router.get('/users', authenticate, referralController.getReferredUsers.bind(referralController));
router.post('/daily-bonus', authenticate, referralController.claimDailyBonus.bind(referralController));

export default router;
