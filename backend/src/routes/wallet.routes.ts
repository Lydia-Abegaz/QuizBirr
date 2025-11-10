import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';
import { authenticate, isAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// User routes
router.get('/balance', authenticate, walletController.getBalance.bind(walletController));
router.get('/transactions', authenticate, walletController.getTransactionHistory.bind(walletController));
router.post('/deposit', authenticate, walletController.initiateDeposit.bind(walletController));
router.post('/withdraw', authenticate, walletController.initiateWithdrawal.bind(walletController));

// Telebirr routes
router.post('/telebirr/init', authenticate, walletController.initTelebirr.bind(walletController));
router.post('/telebirr/webhook', walletController.telebirrWebhook.bind(walletController));

// Manual bank deposit receipt upload
router.post('/deposit/bank/receipt', authenticate, upload.single('receipt'), walletController.uploadBankReceipt.bind(walletController));

// Admin routes
router.post('/deposit/:transactionId/confirm', authenticate, isAdmin, walletController.confirmDeposit.bind(walletController));
router.post('/withdraw/:transactionId/process', authenticate, isAdmin, walletController.processWithdrawal.bind(walletController));

export default router;
