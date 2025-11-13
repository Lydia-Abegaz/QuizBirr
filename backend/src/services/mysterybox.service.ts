import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ledgerService } from './ledger.service';

interface MysteryBoxReward {
  type: 'small' | 'medium' | 'large' | 'jackpot';
  amount: number;
  probability: number;
  minPoints: number;
}

export class MysteryBoxService {
  private rewards: MysteryBoxReward[] = [
    { type: 'small', amount: 1.0, probability: 0.50, minPoints: 50 },    // 50% chance - 1 Birr
    { type: 'medium', amount: 5.0, probability: 0.30, minPoints: 100 },  // 30% chance - 5 Birr  
    { type: 'large', amount: 20.0, probability: 0.15, minPoints: 200 },  // 15% chance - 20 Birr
    { type: 'jackpot', amount: 100.0, probability: 0.05, minPoints: 500 } // 5% chance - 100 Birr
  ];

  /**
   * Check if user is eligible for mystery box
   */
  async checkEligibility(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already opened box this week
      const weekStart = this.getWeekStart();
      const existingBox = await prisma.mysteryBox.findFirst({
        where: {
          userId,
          openedAt: {
            gte: weekStart
          }
        }
      });

      const minPointsRequired = Math.min(...this.rewards.map(r => r.minPoints));
      
      return {
        eligible: !existingBox && user.points >= minPointsRequired,
        currentPoints: user.points,
        minPointsRequired,
        alreadyOpened: !!existingBox,
        nextEligibleDate: existingBox ? this.getNextWeekStart() : null
      };
    } catch (error) {
      console.error('Check mystery box eligibility error:', error);
      throw new Error('Failed to check eligibility');
    }
  }

  /**
   * Open mystery box and get reward
   */
  async openMysteryBox(userId: string, pointsToSpend: number) {
    try {
      const eligibility = await this.checkEligibility(userId);
      
      if (!eligibility.eligible) {
        if (eligibility.alreadyOpened) {
          throw new Error('You have already opened a mystery box this week');
        }
        throw new Error(`Insufficient points. Need at least ${eligibility.minPointsRequired} points`);
      }

      if (pointsToSpend < Math.min(...this.rewards.map(r => r.minPoints))) {
        throw new Error('Not enough points for mystery box');
      }

      if (pointsToSpend > eligibility.currentPoints) {
        throw new Error('Insufficient points');
      }

      // Determine reward based on points spent and probability
      const availableRewards = this.rewards.filter(r => pointsToSpend >= r.minPoints);
      const selectedReward = this.selectRandomReward(availableRewards);

      const result = await prisma.$transaction(async (tx) => {
        // Deduct points from user
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            points: { decrement: pointsToSpend }
          }
        });

        // Add money to user balance
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: { increment: selectedReward.amount }
          }
        });

        // Create mystery box record
        const mysteryBox = await tx.mysteryBox.create({
          data: {
            userId,
            pointsSpent: pointsToSpend,
            rewardType: selectedReward.type,
            rewardAmount: new Prisma.Decimal(selectedReward.amount),
            openedAt: new Date()
          }
        });

        // Create transaction record
        const transaction = await tx.transaction.create({
          data: {
            userId,
            type: 'bonus',
            amount: new Prisma.Decimal(selectedReward.amount),
            status: 'completed',
            reference: `MYSTERY-${mysteryBox.id}`,
            description: `Mystery box ${selectedReward.type} reward`,
            metadata: {
              mysteryBoxId: mysteryBox.id,
              pointsToSpend,
              rewardType: selectedReward.type
            }
          }
        });

        // Update ledger
        await ledgerService.ensureUserWallet(userId);
        const userWallet = await ledgerService.getAccountByType('user_wallet', userId);
        const platform = await ledgerService.getAccountByType('platform_liability', null);
        
        if (userWallet && platform) {
          const minor = Math.round(selectedReward.amount * 100);
          await ledgerService.postEntry(
            `mysterybox:${mysteryBox.id}`,
            [
              { accountId: platform.id, debitMinor: minor },
              { accountId: userWallet.id, creditMinor: minor },
            ],
            { 
              type: 'mystery_box', 
              mysteryBoxId: mysteryBox.id,
              rewardType: selectedReward.type 
            }
          );
        }

        return {
          mysteryBox,
          transaction,
          user: updatedUser,
          reward: selectedReward
        };
      });

      return {
        success: true,
        reward: {
          type: selectedReward.type,
          amount: selectedReward.amount,
          pointsSpent
        },
        newBalance: result.user.balance.toNumber() + selectedReward.amount,
        newPoints: result.user.points,
        nextEligibleDate: this.getNextWeekStart()
      };

    } catch (error) {
      console.error('Open mystery box error:', error);
      throw error;
    }
  }

  /**
   * Get user's mystery box history
   */
  async getMysteryBoxHistory(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [boxes, total] = await Promise.all([
        prisma.mysteryBox.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { openedAt: 'desc' }
        }),
        prisma.mysteryBox.count({ where: { userId } })
      ]);

      return {
        boxes: boxes.map(box => ({
          ...box,
          rewardAmount: box.rewardAmount.toNumber()
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get mystery box history error:', error);
      throw new Error('Failed to get mystery box history');
    }
  }

  /**
   * Get mystery box statistics
   */
  async getMysteryBoxStats(userId: string) {
    try {
      const stats = await prisma.mysteryBox.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { 
          pointsSpent: true,
          rewardAmount: true 
        }
      });

      const rewardsByType = await prisma.mysteryBox.groupBy({
        by: ['rewardType'],
        where: { userId },
        _count: { rewardType: true },
        _sum: { rewardAmount: true }
      });

      return {
        totalBoxesOpened: stats._count.id || 0,
        totalPointsSpent: stats._sum.pointsSpent || 0,
        totalRewardsEarned: stats._sum.rewardAmount?.toNumber() || 0,
        rewardBreakdown: rewardsByType.map((r: any) => ({
          type: r.rewardType,
          count: r._count.rewardType,
          totalAmount: r._sum.rewardAmount?.toNumber() || 0
        }))
      };
    } catch (error) {
      console.error('Get mystery box stats error:', error);
      throw new Error('Failed to get mystery box stats');
    }
  }

  /**
   * Admin: Get all mystery box activity
   */
  async getAllMysteryBoxActivity(page: number = 1, limit: number = 50) {
    try {
      const skip = (page - 1) * limit;
      
      const [boxes, total] = await Promise.all([
        prisma.mysteryBox.findMany({
          include: {
            user: {
              select: {
                phoneNumber: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { openedAt: 'desc' }
        }),
        prisma.mysteryBox.count()
      ]);

      return {
        boxes: boxes.map(box => ({
          ...box,
          rewardAmount: box.rewardAmount.toNumber(),
          user: {
            phoneNumber: box.user.phoneNumber.slice(-4).padStart(box.user.phoneNumber.length, '*')
          }
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get all mystery box activity error:', error);
      throw new Error('Failed to get mystery box activity');
    }
  }

  /**
   * Select random reward based on probabilities
   */
  private selectRandomReward(availableRewards: MysteryBoxReward[]): MysteryBoxReward {
    const random = Math.random();
    let cumulativeProbability = 0;

    // Normalize probabilities for available rewards
    const totalProbability = availableRewards.reduce((sum, r) => sum + r.probability, 0);
    
    for (const reward of availableRewards) {
      cumulativeProbability += reward.probability / totalProbability;
      if (random <= cumulativeProbability) {
        return reward;
      }
    }

    // Fallback to smallest reward
    return availableRewards[availableRewards.length - 1];
  }

  /**
   * Get start of current week (Monday 00:00)
   */
  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);
    
    return weekStart;
  }

  /**
   * Get start of next week
   */
  private getNextWeekStart(): Date {
    const weekStart = this.getWeekStart();
    weekStart.setDate(weekStart.getDate() + 7);
    return weekStart;
  }
}

export const mysteryBoxService = new MysteryBoxService();
