import { Router } from 'express';
import authRoutes from './auth.routes';
import quizRoutes from './quiz.routes';
import walletRoutes from './wallet.routes';
import taskRoutes from './task.routes';
import referralRoutes from './referral.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);
router.use('/wallet', walletRoutes);
router.use('/tasks', taskRoutes);
router.use('/referral', referralRoutes);

export default router;
