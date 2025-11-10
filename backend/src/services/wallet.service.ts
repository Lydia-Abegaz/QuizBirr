import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'crypto';
import { ledgerService } from './ledger.service';

const prisma = new PrismaClient();

export class WalletService {
  async getBalance(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
      });
      if (!user) throw new Error('User not found');

      await ledgerService.ensureUserWallet(userId);
      const minor = await ledgerService.getUserBalanceMinor(userId);
      return {
        balance: minor / 100,
        points: user.points
      };
    } catch (error) {
      console.error('Get balance error:', error);
      throw new Error('Failed to get balance');
    }
  }
  
  async getTransactionHistory(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.transaction.count({ where: { userId } })
      ]);
      
      return {
        transactions: transactions.map(t => ({
          ...t,
          amount: t.amount.toNumber()
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get transaction history error:', error);
      throw new Error('Failed to get transaction history');
    }
  }
  
  async initiateDeposit(userId: string, amount: number, method: 'telebirr' | 'bank') {
    try {
      if (amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      const reference = `DEP-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
      
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'deposit',
          amount: new Prisma.Decimal(amount),
          status: 'pending',
          reference,
          description: `Deposit via ${method}`,
          metadata: { method }
        }
      });
      
      // TODO: Integrate with payment provider (Telebirr API)
      // For now, return the transaction for manual processing
      
      return {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount.toNumber(),
        method,
        status: transaction.status
      };
    } catch (error) {
      console.error('Initiate deposit error:', error);
      throw new Error('Failed to initiate deposit');
    }
  }
  
  async confirmDeposit(transactionId: string, adminId: string) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      if (transaction.status !== 'pending') {
        throw new Error('Transaction already processed');
      }
      
      // Update transaction and post ledger entry
      const result = await prisma.$transaction(async (tx) => {
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'completed',
            processedAt: new Date(),
            metadata: {
              ...(transaction.metadata as object),
              processedBy: adminId
            }
          }
        });
        // Ledger: credit user wallet, debit platform liability
        await ledgerService.ensureUserWallet(transaction.userId);
        const userWallet = await ledgerService.getAccountByType('user_wallet', transaction.userId);
        const platform = await ledgerService.getAccountByType('platform_liability', null);
        if (!userWallet || !platform) throw new Error('Accounts missing');
        const minor = Math.round(Number(transaction.amount) * 100);
        await ledgerService.postEntry(
          `deposit:${transaction.reference}`,
          [
            { accountId: platform.id, debitMinor: minor },
            { accountId: userWallet.id, creditMinor: minor },
          ],
          { type: 'deposit', txId: transaction.id }
        );
        return { transaction: updatedTransaction };
      });
      
      return result;
    } catch (error) {
      console.error('Confirm deposit error:', error);
      throw new Error('Failed to confirm deposit');
    }
  }
  
  async initiateWithdrawal(userId: string, amount: number) {
    try {
      const balanceMinor = await ledgerService.getUserBalanceMinor(userId);
      if (balanceMinor < Math.round(amount * 100)) {
        throw new Error('Insufficient balance');
      }
      
      if (amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Check if user has pending tasks
      const pendingTasks = await prisma.taskSubmission.count({
        where: {
          userId,
          status: 'pending'
        }
      });
      
      // Get active withdrawal tasks
      const withdrawalTasks = await prisma.task.findMany({
        where: { isActive: true },
        take: 3 // Require 3 tasks for withdrawal
      });
      
      if (withdrawalTasks.length === 0) {
        throw new Error('No withdrawal tasks available. Please contact support.');
      }
      
      const reference = `WD-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
      
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          type: 'withdrawal',
          amount: new Prisma.Decimal(amount),
          status: 'pending',
          reference,
          description: 'Withdrawal request',
          metadata: {
            requiresTasks: true,
            tasksRequired: withdrawalTasks.map(t => t.id)
          }
        }
      });
      
      return {
        transactionId: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount.toNumber(),
        status: transaction.status,
        tasks: withdrawalTasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          type: t.type,
          reward: t.reward.toNumber()
        }))
      };
    } catch (error) {
      console.error('Initiate withdrawal error:', error);
      throw error;
    }
  }
  
  async processWithdrawal(transactionId: string, adminId: string, approved: boolean, reason?: string) {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId }
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      if (transaction.status !== 'pending') {
        throw new Error('Transaction already processed');
      }
      
      if (!approved) {
        // Reject withdrawal
        await prisma.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'cancelled',
            processedAt: new Date(),
            metadata: {
              ...(transaction.metadata as object),
              processedBy: adminId,
              rejectionReason: reason
            }
          }
        });
        
        return { success: true, message: 'Withdrawal rejected' };
      }

      // Ensure all required tasks are approved before payout
      const meta = (transaction.metadata as any) || {};
      const requiredTaskIds: string[] = Array.isArray(meta.tasksRequired) ? meta.tasksRequired : [];
      if (requiredTaskIds.length > 0) {
        const approvedCount = await prisma.taskSubmission.count({
          where: {
            userId: transaction.userId,
            taskId: { in: requiredTaskIds },
            status: 'approved'
          }
        });
        if (approvedCount < requiredTaskIds.length) {
          throw new Error('Required withdrawal tasks are not fully approved yet');
        }
      }

      // Approve withdrawal - post ledger entry to deduct user wallet
      const result = await prisma.$transaction(async (tx) => {
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: 'completed',
            processedAt: new Date(),
            metadata: {
              ...(transaction.metadata as object),
              processedBy: adminId
            }
          }
        });
        await ledgerService.ensureUserWallet(transaction.userId);
        const userWallet = await ledgerService.getAccountByType('user_wallet', transaction.userId);
        const withdrawals = await ledgerService.getAccountByType('withdrawals_outgoing', null);
        if (!userWallet || !withdrawals) throw new Error('Accounts missing');
        const minor = Math.round(Number(transaction.amount) * 100);
        await ledgerService.postEntry(
          `withdrawal:${transaction.reference}`,
          [
            { accountId: userWallet.id, debitMinor: minor },
            { accountId: withdrawals.id, creditMinor: minor },
          ],
          { type: 'withdrawal', txId: transaction.id }
        );
        return { transaction: updatedTransaction };
      });
      
      return { success: true, message: 'Withdrawal approved', data: result };
    } catch (error) {
      console.error('Process withdrawal error:', error);
      throw new Error('Failed to process withdrawal');
    }
  }

  async createOrAttachBankReceipt(
    userId: string,
    amount: number,
    receiptPath: string,
    transactionId?: string
  ) {
    try {
      if (amount <= 0) throw new Error('Invalid amount');

      if (transactionId) {
        const existing = await prisma.transaction.findFirst({
          where: { id: transactionId, userId, type: 'deposit', status: 'pending' }
        });
        if (!existing) throw new Error('Pending deposit transaction not found');
        const updated = await prisma.transaction.update({
          where: { id: existing.id },
          data: {
            amount: new Prisma.Decimal(amount),
            metadata: {
              ...(existing.metadata as object),
              method: 'bank',
              receiptPath
            },
            description: 'Deposit via bank (receipt uploaded)'
          }
        });
        return {
          transactionId: updated.id,
          reference: updated.reference,
          amount: updated.amount.toNumber(),
          status: updated.status,
          method: 'bank',
          receiptPath
        };
      }

      const reference = `DEP-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
      const created = await prisma.transaction.create({
        data: {
          userId,
          type: 'deposit',
          amount: new Prisma.Decimal(amount),
          status: 'pending',
          reference,
          description: 'Deposit via bank (receipt uploaded)',
          metadata: { method: 'bank', receiptPath }
        }
      });
      return {
        transactionId: created.id,
        reference: created.reference,
        amount: created.amount.toNumber(),
        status: created.status,
        method: 'bank',
        receiptPath
      };
    } catch (error) {
      console.error('Bank receipt upload error:', error);
      throw new Error('Failed to upload bank receipt');
    }
  }
}

export const walletService = new WalletService();
