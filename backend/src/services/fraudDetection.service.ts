import { prisma } from '../lib/prisma';

interface FraudAlert {
  userId: string;
  type: 'suspicious_quiz_pattern' | 'rapid_transactions' | 'multiple_accounts' | 'unusual_task_completion' | 'referral_abuse';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: any;
}

export class FraudDetectionService {
  /**
   * Check for suspicious quiz patterns
   */
  async checkSuspiciousQuizPattern(userId: string): Promise<FraudAlert | null> {
    try {
      const recentAttempts = await prisma.quizAttempt.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      if (recentAttempts.length < 10) return null;

      // Check for perfect accuracy (suspicious)
      const correctAnswers = recentAttempts.filter(a => a.isCorrect).length;
      const accuracy = correctAnswers / recentAttempts.length;

      if (accuracy > 0.95 && recentAttempts.length > 20) {
        return {
          userId,
          type: 'suspicious_quiz_pattern',
          severity: 'high',
          description: `User has ${(accuracy * 100).toFixed(1)}% accuracy over ${recentAttempts.length} recent attempts`,
          metadata: {
            accuracy,
            totalAttempts: recentAttempts.length,
            correctAnswers,
            timeWindow: '1 hour'
          }
        };
      }

      // Check for rapid-fire attempts (bot-like behavior)
      const timeDiffs = [];
      for (let i = 1; i < recentAttempts.length; i++) {
        const diff = recentAttempts[i-1].createdAt.getTime() - recentAttempts[i].createdAt.getTime();
        timeDiffs.push(diff);
      }

      const avgTimeBetweenAttempts = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      
      if (avgTimeBetweenAttempts < 5000 && recentAttempts.length > 15) { // Less than 5 seconds average
        return {
          userId,
          type: 'suspicious_quiz_pattern',
          severity: 'medium',
          description: `User averaging ${(avgTimeBetweenAttempts / 1000).toFixed(1)} seconds between quiz attempts`,
          metadata: {
            avgTimeBetweenAttempts,
            totalAttempts: recentAttempts.length,
            timeWindow: '1 hour'
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Fraud detection - quiz pattern check error:', error);
      return null;
    }
  }

  /**
   * Check for rapid transaction patterns
   */
  async checkRapidTransactions(userId: string): Promise<FraudAlert | null> {
    try {
      const recentTransactions = await prisma.transaction.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (recentTransactions.length > 20) {
        return {
          userId,
          type: 'rapid_transactions',
          severity: 'medium',
          description: `User has ${recentTransactions.length} transactions in the last 24 hours`,
          metadata: {
            transactionCount: recentTransactions.length,
            timeWindow: '24 hours'
          }
        };
      }

      // Check for multiple deposit attempts
      const deposits = recentTransactions.filter(t => t.type === 'deposit');
      if (deposits.length > 10) {
        return {
          userId,
          type: 'rapid_transactions',
          severity: 'high',
          description: `User has ${deposits.length} deposit attempts in 24 hours`,
          metadata: {
            depositCount: deposits.length,
            timeWindow: '24 hours'
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Fraud detection - rapid transactions check error:', error);
      return null;
    }
  }

  /**
   * Check for multiple accounts from same device/IP
   */
  async checkMultipleAccounts(phoneNumber: string, deviceId?: string): Promise<FraudAlert | null> {
    try {
      if (!deviceId) return null;

      const accountsWithSameDevice = await prisma.user.findMany({
        where: {
          deviceId,
          phoneNumber: { not: phoneNumber }
        }
      });

      if (accountsWithSameDevice.length > 2) {
        return {
          userId: 'system',
          type: 'multiple_accounts',
          severity: 'high',
          description: `Device ${deviceId} associated with ${accountsWithSameDevice.length + 1} accounts`,
          metadata: {
            deviceId,
            accountCount: accountsWithSameDevice.length + 1,
            phoneNumbers: accountsWithSameDevice.map(u => u.phoneNumber.slice(-4).padStart(u.phoneNumber.length, '*'))
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Fraud detection - multiple accounts check error:', error);
      return null;
    }
  }

  /**
   * Check for unusual task completion patterns
   */
  async checkUnusualTaskCompletion(userId: string): Promise<FraudAlert | null> {
    try {
      const recentSubmissions = await prisma.taskSubmission.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        include: { task: true }
      });

      if (recentSubmissions.length > 15) {
        return {
          userId,
          type: 'unusual_task_completion',
          severity: 'medium',
          description: `User submitted ${recentSubmissions.length} tasks in 24 hours`,
          metadata: {
            submissionCount: recentSubmissions.length,
            timeWindow: '24 hours'
          }
        };
      }

      // Check for completing same task type rapidly
      const taskTypes = recentSubmissions.map(s => s.task.type);
      const typeCount = taskTypes.reduce((acc: any, type) => {
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      for (const [type, count] of Object.entries(typeCount)) {
        if ((count as number) > 10) {
          return {
            userId,
            type: 'unusual_task_completion',
            severity: 'medium',
            description: `User submitted ${count} tasks of type '${type}' in 24 hours`,
            metadata: {
              taskType: type,
              count,
              timeWindow: '24 hours'
            }
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Fraud detection - task completion check error:', error);
      return null;
    }
  }

  /**
   * Check for referral abuse
   */
  async checkReferralAbuse(userId: string): Promise<FraudAlert | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { referralCode: true }
      });

      if (!user) return null;

      // Check for too many referrals in short time
      const recentReferrals = await prisma.user.findMany({
        where: {
          referredBy: user.referralCode,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      if (recentReferrals.length > 10) {
        return {
          userId,
          type: 'referral_abuse',
          severity: 'high',
          description: `User referred ${recentReferrals.length} new users in 24 hours`,
          metadata: {
            referralCount: recentReferrals.length,
            timeWindow: '24 hours'
          }
        };
      }

      // Check for referrals with similar phone patterns
      const phonePatterns = recentReferrals.map(r => r.phoneNumber.slice(0, -2));
      const uniquePatterns = new Set(phonePatterns);
      
      if (recentReferrals.length > 5 && uniquePatterns.size < recentReferrals.length * 0.7) {
        return {
          userId,
          type: 'referral_abuse',
          severity: 'high',
          description: `Suspicious phone number patterns in referrals`,
          metadata: {
            referralCount: recentReferrals.length,
            uniquePatterns: uniquePatterns.size,
            suspiciousRatio: uniquePatterns.size / recentReferrals.length
          }
        };
      }

      return null;
    } catch (error) {
      console.error('Fraud detection - referral abuse check error:', error);
      return null;
    }
  }

  /**
   * Run comprehensive fraud check for a user
   */
  async runFraudCheck(userId: string, deviceId?: string): Promise<FraudAlert[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phoneNumber: true }
      });

      if (!user) return [];

      const checks = await Promise.allSettled([
        this.checkSuspiciousQuizPattern(userId),
        this.checkRapidTransactions(userId),
        this.checkMultipleAccounts(user.phoneNumber, deviceId),
        this.checkUnusualTaskCompletion(userId),
        this.checkReferralAbuse(userId)
      ]);

      const alerts: FraudAlert[] = [];
      
      checks.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          alerts.push(result.value);
        }
      });

      // Log alerts to database for admin review
      if (alerts.length > 0) {
        await this.logFraudAlerts(alerts);
      }

      return alerts;
    } catch (error) {
      console.error('Fraud detection - comprehensive check error:', error);
      return [];
    }
  }

  /**
   * Log fraud alerts to database
   */
  private async logFraudAlerts(alerts: FraudAlert[]): Promise<void> {
    try {
      for (const alert of alerts) {
        await prisma.fraudAlert.create({
          data: {
            userId: alert.userId === 'system' ? null : alert.userId,
            type: alert.type,
            severity: alert.severity,
            description: alert.description,
            metadata: alert.metadata,
            status: 'pending'
          }
        });
      }
    } catch (error) {
      console.error('Error logging fraud alerts:', error);
    }
  }

  /**
   * Get fraud alerts for admin review
   */
  async getFraudAlerts(page: number = 1, limit: number = 50, severity?: string) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};
      
      if (severity) {
        where.severity = severity;
      }

      const [alerts, total] = await Promise.all([
        prisma.fraudAlert.findMany({
          where,
          include: {
            user: {
              select: {
                phoneNumber: true,
                isActive: true,
                isBanned: true
              }
            }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.fraudAlert.count({ where })
      ]);

      return {
        alerts: alerts.map(alert => ({
          ...alert,
          user: alert.user ? {
            phoneNumber: alert.user.phoneNumber.slice(-4).padStart(alert.user.phoneNumber.length, '*'),
            isActive: alert.user.isActive,
            isBanned: alert.user.isBanned
          } : null
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get fraud alerts error:', error);
      throw new Error('Failed to get fraud alerts');
    }
  }

  /**
   * Update fraud alert status
   */
  async updateFraudAlertStatus(alertId: string, status: 'pending' | 'reviewed' | 'resolved' | 'false_positive', adminId: string) {
    try {
      const alert = await prisma.fraudAlert.update({
        where: { id: alertId },
        data: {
          status,
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      });

      return alert;
    } catch (error) {
      console.error('Update fraud alert status error:', error);
      throw new Error('Failed to update fraud alert status');
    }
  }
}

export const fraudDetectionService = new FraudDetectionService();
