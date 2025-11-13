import { Request, Response } from 'express';
import { chapaService } from '../services/chapa.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class ChapaController {
  /**
   * Initialize Chapa payment
   */
  async initPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      const { amount, phoneNumber } = req.body;

      if (!amount || amount <= 0) {
        return errorResponse(res, 'Valid amount is required', 400);
      }

      if (amount < 10) {
        return errorResponse(res, 'Minimum deposit amount is 10 ETB', 400);
      }

      if (amount > 50000) {
        return errorResponse(res, 'Maximum deposit amount is 50,000 ETB', 400);
      }

      const result = await chapaService.initPayment(
        req.user.userId, 
        amount, 
        phoneNumber
      );

      return successResponse(res, result, 'Payment initialized successfully', 201);
    } catch (error: any) {
      console.error('Chapa init payment error:', error);
      return errorResponse(res, error.message || 'Failed to initialize payment', 500);
    }
  }

  /**
   * Handle Chapa webhook
   */
  async webhook(req: Request, res: Response) {
    try {
      const signature = req.header('chapa-signature') || req.header('x-chapa-signature');
      const rawBody = (req as any).rawBody as Buffer;

      // Verify webhook signature
      if (!chapaService.verifyWebhookSignature(rawBody, signature)) {
        console.error('Invalid Chapa webhook signature');
        return res.status(401).json({ message: 'Invalid signature' });
      }

      const payload = req.body;
      
      if (!payload || !payload.event || !payload.data) {
        return res.status(400).json({ message: 'Invalid webhook payload' });
      }

      console.log('Chapa webhook received:', payload.event, payload.data.tx_ref);

      const result = await chapaService.processWebhook(payload);

      if (result.processed) {
        console.log(`Chapa payment processed: ${result.reference} - ${result.amount} ETB`);
      }

      return res.status(200).json({ 
        message: 'Webhook processed successfully',
        processed: result.processed 
      });

    } catch (error: any) {
      console.error('Chapa webhook processing error:', error);
      return res.status(500).json({ 
        message: 'Webhook processing failed',
        error: error.message 
      });
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      const { reference } = req.params;

      if (!reference) {
        return errorResponse(res, 'Payment reference is required', 400);
      }

      const result = await chapaService.verifyPayment(reference);

      return successResponse(res, result, 'Payment verification completed');
    } catch (error: any) {
      console.error('Chapa verify payment error:', error);
      return errorResponse(res, error.message || 'Failed to verify payment', 500);
    }
  }
}

export const chapaController = new ChapaController();
