import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { ledgerService } from './ledger.service';
import { prisma } from '../lib/prisma';

interface ChapaInitResponse {
  message: string;
  status: string;
  data: {
    checkout_url: string;
  };
}

interface ChapaWebhookPayload {
  event: string;
  data: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    tx_ref: string;
    customer: {
      email: string;
      phone_number: string;
    };
    created_at: string;
    updated_at: string;
  };
}

export class ChapaService {
  private apiKey = process.env.CHAPA_SECRET_KEY || '';
  private webhookSecret = process.env.CHAPA_WEBHOOK_SECRET || '';
  private baseUrl = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';

  /**
   * Initialize payment with Chapa
   */
  async initPayment(userId: string, amount: number, phoneNumber?: string) {
    if (amount <= 0) throw new Error('Invalid amount');
    if (!this.apiKey) throw new Error('Chapa API key not configured');

    const reference = `QBR-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Create transaction record
    const tx = await prisma.transaction.create({
      data: {
        userId,
        type: 'deposit',
        amount: new Prisma.Decimal(amount),
        status: 'pending',
        reference,
        description: 'Deposit via Chapa',
        metadata: { method: 'chapa', provider: 'chapa' }
      }
    });

    try {
      // Get user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
      });

      // Prepare Chapa payment request
      const paymentData = {
        amount: amount.toString(),
        currency: 'ETB',
        email: `user${userId.slice(0, 8)}@quizbirr.app`, // Generate email from user ID
        first_name: 'QuizBirr',
        last_name: 'User',
        phone_number: phoneNumber || user?.phoneNumber || '',
        tx_ref: reference,
        callback_url: `${process.env.FRONTEND_URL}/payment/success`,
        return_url: `${process.env.FRONTEND_URL}/wallet`,
        description: `QuizBirr wallet deposit - ${amount} ETB`,
        meta: {
          user_id: userId,
          transaction_id: tx.id
        }
      };

      // Call Chapa API
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Chapa API error: ${error}`);
      }

      const chapaResponse = await response.json() as ChapaInitResponse;

      // Update transaction with Chapa data
      await prisma.transaction.update({
        where: { id: tx.id },
        data: {
          metadata: {
            ...tx.metadata as object,
            chapa_checkout_url: chapaResponse.data.checkout_url
          }
        }
      });

      return {
        transactionId: tx.id,
        reference: tx.reference,
        amount: tx.amount.toNumber(),
        checkoutUrl: chapaResponse.data.checkout_url,
        provider: 'chapa'
      };

    } catch (error) {
      // Mark transaction as failed
      await prisma.transaction.update({
        where: { id: tx.id },
        data: { status: 'failed' }
      });
      
      console.error('Chapa payment initialization error:', error);
      throw new Error('Failed to initialize payment with Chapa');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(rawBody: Buffer, signature?: string): boolean {
    if (!this.webhookSecret || !signature) return false;
    
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(rawBody);
    const expected = hmac.digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  /**
   * Process Chapa webhook
   */
  async processWebhook(payload: ChapaWebhookPayload) {
    const { event, data } = payload;
    
    if (event !== 'charge.success') {
      console.log(`Ignoring Chapa webhook event: ${event}`);
      return { processed: false, reason: 'Event not handled' };
    }

    const reference = data.tx_ref;
    
    // Find transaction
    const tx = await prisma.transaction.findFirst({
      where: { reference, type: 'deposit' }
    });

    if (!tx) {
      throw new Error(`Transaction not found for reference: ${reference}`);
    }

    if (tx.status !== 'pending') {
      return { processed: false, reason: 'Transaction already processed' };
    }

    // Verify amount matches
    const expectedAmount = tx.amount.toNumber();
    if (Math.abs(data.amount - expectedAmount) > 0.01) {
      throw new Error(`Amount mismatch: expected ${expectedAmount}, got ${data.amount}`);
    }

    // Process successful payment
    const result = await prisma.$transaction(async (trx) => {
      // Update transaction status
      const updatedTx = await trx.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
          metadata: {
            ...tx.metadata as object,
            chapa_payment_id: data.id,
            chapa_status: data.status,
            processed_at: new Date().toISOString()
          }
        }
      });

      // Update user wallet
      await ledgerService.ensureUserWallet(tx.userId);
      const userWallet = await ledgerService.getAccountByType('user_wallet', tx.userId);
      const platform = await ledgerService.getAccountByType('platform_liability', null);
      
      if (!userWallet || !platform) {
        throw new Error('Wallet accounts not found');
      }

      const minor = Math.round(data.amount * 100);
      await ledgerService.postEntry(
        `chapa_deposit:${reference}`,
        [
          { accountId: platform.id, debitMinor: minor },
          { accountId: userWallet.id, creditMinor: minor },
        ],
        { 
          type: 'deposit', 
          txId: tx.id, 
          provider: 'chapa',
          chapa_payment_id: data.id 
        }
      );

      return updatedTx;
    });

    return { 
      processed: true, 
      transaction: result,
      amount: data.amount,
      reference 
    };
  }

  /**
   * Verify payment status directly with Chapa API
   */
  async verifyPayment(reference: string) {
    if (!this.apiKey) throw new Error('Chapa API key not configured');

    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Chapa verify API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Chapa payment verification error:', error);
      throw new Error('Failed to verify payment with Chapa');
    }
  }
}

export const chapaService = new ChapaService();
