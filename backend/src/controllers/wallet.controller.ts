import { Response, Request } from 'express';
import { walletService } from '../services/wallet.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';
import { telebirrService } from '../services/telebirr.service';

export class WalletController {
  async getBalance(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const balance = await walletService.getBalance(req.user.userId);
      
      return successResponse(res, balance);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get balance', 500);
    }
  }
  
  async getTransactionHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await walletService.getTransactionHistory(req.user.userId, page, limit);
      
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get transaction history', 500);
    }
  }
  
  async initiateDeposit(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const { amount, method } = req.body;
      
      if (!amount || !method) {
        return errorResponse(res, 'Amount and method are required', 400);
      }
      
      if (!['telebirr', 'bank'].includes(method)) {
        return errorResponse(res, 'Invalid payment method', 400);
      }
      
      const result = await walletService.initiateDeposit(req.user.userId, amount, method);
      
      return successResponse(res, result, 'Deposit initiated successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to initiate deposit', 500);
    }
  }
  
  async initiateWithdrawal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return errorResponse(res, 'Valid amount is required', 400);
      }
      
      const result = await walletService.initiateWithdrawal(req.user.userId, amount);
      
      return successResponse(res, result, 'Withdrawal initiated. Please complete the required tasks.', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to initiate withdrawal', 500);
    }
  }
  
  async confirmDeposit(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      const { transactionId } = req.params;
      const result = await walletService.confirmDeposit(transactionId, req.user.userId);
      return successResponse(res, result, 'Deposit confirmed successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to confirm deposit', 500);
    }
  }
  
  async processWithdrawal(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const { transactionId } = req.params;
      const { approved, reason } = req.body;
      
      if (typeof approved !== 'boolean') {
        return errorResponse(res, 'Approved status is required', 400);
      }
      
      const result = await walletService.processWithdrawal(
        transactionId,
        req.user.userId,
        approved,
        reason
      );
      
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to process withdrawal', 500);
    }
  }

  // Telebirr init (user triggers)
  async initTelebirr(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Unauthorized', 401);
      const { amount } = req.body;
      if (!amount || amount <= 0) return errorResponse(res, 'Valid amount is required', 400);
      const result = await telebirrService.initPayment(req.user.userId, amount);
      return successResponse(res, result, 'Telebirr payment initialized', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to init Telebirr', 500);
    }
  }

  // Telebirr webhook (public)
  async telebirrWebhook(req: Request, res: Response) {
    try {
      const signature = req.header('x-telebirr-signature') || req.header('x-signature');
      const raw = (req as any).rawBody as Buffer;
      if (!telebirrService.verifySignature(raw, signature)) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
      const payload = req.body || {};
      const reference: string | undefined = payload.reference || payload.orderId || payload.merchantOrderId;
      if (!reference) return res.status(400).json({ message: 'Missing reference' });
      await telebirrService.confirmByReference(reference, { provider: 'telebirr', payload });
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Telebirr webhook error:', error);
      return res.status(500).json({ message: 'Webhook processing failed' });
    }
  }

  // Bank receipt upload
  async uploadBankReceipt(req: AuthRequest, res: Response) {
    try {
      if (!req.user) return errorResponse(res, 'Unauthorized', 401);
      const file = (req as any).file as any | undefined;
      const { amount, transactionId } = req.body as { amount?: number; transactionId?: string };
      if (!file) return errorResponse(res, 'Receipt file is required', 400);
      if (!amount || Number(amount) <= 0) return errorResponse(res, 'Valid amount is required', 400);

      // If a pending bank deposit transaction exists, attach receipt; else create new
      const result = await walletService.createOrAttachBankReceipt(
        req.user.userId,
        Number(amount),
        file.path,
        transactionId
      );
      return successResponse(res, result, 'Receipt uploaded, awaiting admin verification', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to upload receipt', 500);
    }
  }
}

export const walletController = new WalletController();
