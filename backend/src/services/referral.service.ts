import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class ReferralService {
  async applyReferralCode(userId: string, referralCode: string) {
    try {
      // Check if user already has a referrer
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.referredBy) {
        throw new Error('User already has a referrer');
      }
      
      // Find referrer by code
      const referrer = await prisma.user.findUnique({
        where: { referralCode }
      });
      
      if (!referrer) {
        throw new Error('Invalid referral code');
      }
      
      if (referrer.id === userId) {
        throw new Error('Cannot refer yourself');
      }
      
      // Update user with referrer
      await prisma.user.update({
        where: { id: userId },
        data: { referredBy: referralCode }
      });
      
      return { success: true, message: 'Referral code applied successfully' };
    } catch (error) {
      console.error('Apply referral code error:', error);
      throw error;
    }
  }
  
  async awardReferralBonus(userId: string) {
    try {
      // This is called when a referred user completes their first verified task
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user || !user.referredBy) {
        return { success: false, message: 'No referrer found' };
      }
      
      // Find the referrer
      const referrer = await prisma.user.findUnique({
        where: { referralCode: user.referredBy }
      });
      
      if (!referrer) {
        return { success: false, message: 'Referrer not found' };
      }
      
      // Check if bonus already awarded
      const existingBonus = await prisma.transaction.findFirst({
        where: {
          userId: referrer.id,
          type: 'referral',
          description: { contains: userId }
        }
      });
      
      if (existingBonus) {
        return { success: false, message: 'Bonus already awarded' };
      }
      
      // Award referral bonus
      const bonusPoints = 50;
      const bonusAmount = new Prisma.Decimal(5.0); // 5 Birr bonus
      
      const result = await prisma.$transaction(async (tx) => {
        // Update referrer's balance and points
        const updatedReferrer = await tx.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: bonusPoints },
            balance: { increment: bonusAmount }
          }
        });
        
        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId: referrer.id,
            type: 'referral',
            amount: bonusAmount,
            status: 'completed',
            reference: `REF-${userId.slice(0, 8)}`,
            description: `Referral bonus for user ${userId}`
          }
        });
        
        return { referrer: updatedReferrer, transaction };
      });
      
      return {
        success: true,
        message: 'Referral bonus awarded',
        data: result
      };
    } catch (error) {
      console.error('Award referral bonus error:', error);
      throw new Error('Failed to award referral bonus');
    }
  }
  
  async getReferralStats(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Count total referrals
      const totalReferrals = await prisma.user.count({
        where: { referredBy: user.referralCode }
      });
      
      // Count active referrals (users who have completed at least one task)
      const activeReferrals = await prisma.user.count({
        where: {
          referredBy: user.referralCode,
          taskSubmissions: {
            some: {
              status: 'approved'
            }
          }
        }
      });
      
      // Calculate total earnings from referrals
      const referralEarnings = await prisma.transaction.aggregate({
        where: {
          userId,
          type: 'referral'
        },
        _sum: {
          amount: true
        }
      });
      
      return {
        referralCode: user.referralCode,
        totalReferrals,
        activeReferrals,
        totalEarnings: referralEarnings._sum.amount?.toNumber() || 0
      };
    } catch (error) {
      console.error('Get referral stats error:', error);
      throw new Error('Failed to get referral stats');
    }
  }
  
  async getReferredUsers(userId: string, page: number = 1, limit: number = 20) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      const skip = (page - 1) * limit;
      
      const [referrals, total] = await Promise.all([
        prisma.user.findMany({
          where: { referredBy: user.referralCode },
          select: {
            id: true,
            phoneNumber: true,
            createdAt: true,
            taskSubmissions: {
              where: { status: 'approved' },
              select: { id: true }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where: { referredBy: user.referralCode } })
      ]);
      
      return {
        referrals: referrals.map(r => ({
          id: r.id,
          phoneNumber: r.phoneNumber.slice(-4).padStart(r.phoneNumber.length, '*'),
          joinedAt: r.createdAt,
          isActive: r.taskSubmissions.length > 0
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get referred users error:', error);
      throw new Error('Failed to get referred users');
    }
  }
  
  async awardDailyLoginBonus(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if user already logged in today
      const existingLogin = await prisma.dailyLogin.findFirst({
        where: {
          userId,
          loginDate: {
            gte: today
          }
        }
      });
      
      if (existingLogin) {
        return { success: false, message: 'Daily bonus already claimed' };
      }
      
      // Get yesterday's login to calculate streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayLogin = await prisma.dailyLogin.findFirst({
        where: {
          userId,
          loginDate: {
            gte: yesterday,
            lt: today
          }
        }
      });
      
      const streak = yesterdayLogin ? yesterdayLogin.streak + 1 : 1;
      const bonusPoints = Math.min(streak * 5, 50); // Max 50 points per day
      const bonusAmount = new Prisma.Decimal(bonusPoints * 0.1);
      
      const result = await prisma.$transaction(async (tx) => {
        // Create daily login record
        await tx.dailyLogin.create({
          data: {
            userId,
            loginDate: today,
            streak
          }
        });
        
        // Update user balance and points
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            points: { increment: bonusPoints },
            balance: { increment: bonusAmount }
          }
        });
        
        // Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'bonus',
            amount: bonusAmount,
            status: 'completed',
            reference: `DAILY-${Date.now()}`,
            description: `Daily login bonus (${streak} day streak)`
          }
        });
        
        return { user, streak, bonusPoints };
      });
      
      return {
        success: true,
        message: 'Daily bonus awarded',
        data: result
      };
    } catch (error) {
      console.error('Award daily login bonus error:', error);
      throw new Error('Failed to award daily bonus');
    }
  }
}

export const referralService = new ReferralService();
