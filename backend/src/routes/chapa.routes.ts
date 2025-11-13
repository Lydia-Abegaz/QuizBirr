import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { chapaController } from '../controllers/chapa.controller';

const router = Router();

// Initialize Chapa payment (authenticated)
router.post('/init', authenticate, chapaController.initPayment.bind(chapaController));

// Chapa webhook (public - no auth required)
router.post('/webhook', chapaController.webhook.bind(chapaController));

// Verify payment status (authenticated)
router.get('/verify/:reference', authenticate, chapaController.verifyPayment.bind(chapaController));

export default router;
