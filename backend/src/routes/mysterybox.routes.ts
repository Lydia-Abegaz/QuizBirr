import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth';
import { mysteryBoxController } from '../controllers/mysterybox.controller';

const router = Router();

// User routes
router.get('/eligibility', authenticate, mysteryBoxController.checkEligibility.bind(mysteryBoxController));
router.post('/open', authenticate, mysteryBoxController.openMysteryBox.bind(mysteryBoxController));
router.get('/history', authenticate, mysteryBoxController.getMysteryBoxHistory.bind(mysteryBoxController));
router.get('/stats', authenticate, mysteryBoxController.getMysteryBoxStats.bind(mysteryBoxController));

// Admin routes
router.get('/admin/activity', authenticate, isAdmin, mysteryBoxController.getAllMysteryBoxActivity.bind(mysteryBoxController));

export default router;
