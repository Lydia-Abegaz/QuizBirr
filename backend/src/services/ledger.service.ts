import { prisma } from '../lib/prisma';

export type LedgerLineInput = {
  accountId: string;
  debitMinor?: number;
  creditMinor?: number;
};

export class LedgerService {
  async ensureSystemAccounts() {
    // Ensure global system accounts exist
    const types: Array<'platform_liability' | 'deposits_incoming' | 'withdrawals_outgoing'> = [
      'platform_liability',
      'deposits_incoming',
      'withdrawals_outgoing',
    ];
    for (const type of types) {
      const existing = await prisma.account.findFirst({ where: { type, userId: null } });
      if (!existing) {
        await prisma.account.create({ data: { type } });
      }
    }
  }

  async ensureUserWallet(userId: string) {
    await this.ensureSystemAccounts();
    return prisma.account.upsert({
      where: { type_userId: { type: 'user_wallet', userId } },
      update: {},
      create: { type: 'user_wallet', userId },
    });
  }

  async getAccountByType(type: 'user_wallet' | 'platform_liability' | 'deposits_incoming' | 'withdrawals_outgoing', userId?: string | null) {
    if (userId) {
      return prisma.account.findUnique({ where: { type_userId: { type, userId } } });
    }
    return prisma.account.findFirst({ where: { type, userId: null } });
  }

  async postEntry(idempotencyKey: string, lines: LedgerLineInput[], meta?: any) {
    if (lines.length < 2) throw new Error('Ledger entry must have at least two lines');
    // Validate balancing
    const totalDebit = lines.reduce((s, l) => s + (l.debitMinor ?? 0), 0);
    const totalCredit = lines.reduce((s, l) => s + (l.creditMinor ?? 0), 0);
    if (totalDebit !== totalCredit) throw new Error('Ledger entry not balanced');

    return prisma.$transaction(async (tx) => {
      // Idempotency
      const existing = await tx.ledgerEntry.findUnique({ where: { idempotencyKey } });
      if (existing) return existing;

      const entry = await tx.ledgerEntry.create({ data: { idempotencyKey, meta } });
      for (const l of lines) {
        await tx.ledgerLine.create({
          data: {
            entryId: entry.id,
            accountId: l.accountId,
            debitMinor: l.debitMinor ?? 0,
            creditMinor: l.creditMinor ?? 0,
          },
        });
      }
      return entry;
    });
  }

  async getUserBalanceMinor(userId: string): Promise<number> {
    const wallet = await prisma.account.findUnique({ where: { type_userId: { type: 'user_wallet', userId } } });
    if (!wallet) return 0;
    const agg = await prisma.ledgerLine.aggregate({
      _sum: { debitMinor: true, creditMinor: true },
      where: { accountId: wallet.id },
    });
    const debit = agg._sum.debitMinor ?? 0;
    const credit = agg._sum.creditMinor ?? 0;
    // For liability-style wallet: balance = credit - debit (net increase when credited)
    return credit - debit;
  }
}

export const ledgerService = new LedgerService();
