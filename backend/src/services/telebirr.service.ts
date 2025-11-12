import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { ledgerService } from './ledger.service';
import { prisma } from '../lib/prisma';

export class TelebirrService {
  private webhookSecret = process.env.TELEBIRR_WEBHOOK_SECRET || '';

  verifySignature(rawBody: Buffer, signature?: string): boolean {
    if (!this.webhookSecret || !signature) return false;
    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    hmac.update(rawBody);
    const expected = hmac.digest('hex');
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }

  async initPayment(userId: string, amount: number) {
    if (amount <= 0) throw new Error('Invalid amount');

    const reference = `DEP-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const tx = await prisma.transaction.create({
      data: {
        userId,
        type: 'deposit',
        amount: new Prisma.Decimal(amount),
        status: 'pending',
        reference,
        description: 'Deposit via telebirr',
        metadata: { method: 'telebirr' }
      }
    });

    // Normally call Telebirr create payment API here and get a paymentUrl/qrCode
    // For now, return a mock payload with our reference used as orderId
    return {
      transactionId: tx.id,
      reference: tx.reference,
      amount: tx.amount.toNumber(),
      paymentUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/${tx.reference}`
    };
  }

  async confirmByReference(reference: string, providerMeta?: any) {
    const tx = await prisma.transaction.findFirst({ where: { reference, type: 'deposit' } });
    if (!tx) throw new Error('Transaction not found');
    if (tx.status !== 'pending') return { alreadyProcessed: true };

    const result = await prisma.$transaction(async (trx) => {
      const updated = await trx.transaction.update({
        where: { id: tx.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
          metadata: { ...(tx.metadata as object), providerMeta }
        }
      });

      await ledgerService.ensureUserWallet(tx.userId);
      const userWallet = await ledgerService.getAccountByType('user_wallet', tx.userId);
      const platform = await ledgerService.getAccountByType('platform_liability', null);
      if (!userWallet || !platform) throw new Error('Accounts missing');
      const minor = Math.round(Number(tx.amount) * 100);
      await ledgerService.postEntry(
        `deposit:${tx.reference}`,
        [
          { accountId: platform.id, debitMinor: minor },
          { accountId: userWallet.id, creditMinor: minor },
        ],
        { type: 'deposit', txId: tx.id }
      );
      return updated;
    });

    return { success: true, transaction: result };
  }
}

export const telebirrService = new TelebirrService();
