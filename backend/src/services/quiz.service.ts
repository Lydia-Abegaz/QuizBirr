import { Prisma } from '@prisma/client';
import { ledgerService } from './ledger.service';
import { prisma } from '../lib/prisma';

export class QuizService {
  async getRandomQuiz(userId: string) {
    try {
      // Get quizzes that the user hasn't answered yet
      const answeredQuizIds = await prisma.quizAttempt.findMany({
        where: { userId },
        select: { quizId: true }
      });
      
      const answeredIds = answeredQuizIds.map(a => a.quizId);
      
      // Get a random quiz that hasn't been answered
      const quizzes = await prisma.quiz.findMany({
        where: {
          isActive: true,
          id: { notIn: answeredIds }
        },
        take: 10
      });
      
      if (quizzes.length === 0) {
        return null;
      }
      
      // Return a random quiz from the available ones
      const randomIndex = Math.floor(Math.random() * quizzes.length);
      const quiz = quizzes[randomIndex];
      
      // Don't send the answer to the client
      const { answer, ...quizWithoutAnswer } = quiz;
      
      return quizWithoutAnswer;
    } catch (error) {
      console.error('Get random quiz error:', error);
      throw new Error('Failed to get quiz');
    }
  }
  
  async submitAnswer(userId: string, quizId: string, userAnswer: boolean) {
    try {
      // Check if user has already answered this quiz
      const existingAttempt = await prisma.quizAttempt.findFirst({
        where: { userId, quizId }
      });
      
      if (existingAttempt) {
        throw new Error('Quiz already answered');
      }
      
      // Get the quiz
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId }
      });
      
      if (!quiz) {
        throw new Error('Quiz not found');
      }
      
      const isCorrect = quiz.answer === userAnswer;
      const pointsEarned = isCorrect ? quiz.points : -Math.floor(quiz.points / 2);
      const weightMinor = quiz.weightMinor ?? 100;
      const moneyMinor = weightMinor; // Fixed per-question minor amount
      const moneyBirr = moneyMinor / 100;
      
      // Create quiz attempt, update points, record transaction, and post ledger entry
      const result = await prisma.$transaction(async (tx) => {
        // Create quiz attempt
        const attempt = await tx.quizAttempt.create({
          data: {
            userId,
            quizId,
            isCorrect,
            pointsEarned
          }
        });
        
        // Update user points only
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            points: { increment: pointsEarned }
          }
        });
        
        // Create transaction record
        await tx.transaction.create({
          data: {
            userId,
            type: 'quiz',
            amount: new Prisma.Decimal(isCorrect ? moneyBirr : -moneyBirr),
            status: 'completed',
            reference: `QUIZ-${attempt.id}`,
            description: `Quiz ${isCorrect ? 'correct' : 'incorrect'} answer`
          }
        });
        // Post ledger entry for money movement
        await ledgerService.ensureUserWallet(userId);
        const userWallet = await ledgerService.getAccountByType('user_wallet', userId);
        const platform = await ledgerService.getAccountByType('platform_liability', null);
        if (!userWallet || !platform) throw new Error('Accounts missing');
        if (isCorrect) {
          await ledgerService.postEntry(
            `quiz:correct:${attempt.id}`,
            [
              { accountId: platform.id, debitMinor: moneyMinor },
              { accountId: userWallet.id, creditMinor: moneyMinor },
            ],
            { quizId, attemptId: attempt.id, outcome: 'correct' }
          );
        } else {
          await ledgerService.postEntry(
            `quiz:wrong:${attempt.id}`,
            [
              { accountId: userWallet.id, debitMinor: moneyMinor },
              { accountId: platform.id, creditMinor: moneyMinor },
            ],
            { quizId, attemptId: attempt.id, outcome: 'wrong' }
          );
        }
        
        return { attempt, user };
      });
      
      return {
        isCorrect,
        pointsEarned,
        balanceChange: isCorrect ? moneyBirr : -moneyBirr,
        // New wallet balance can be fetched via walletService.getBalance if needed
        newPoints: result.user.points
      };
    } catch (error) {
      console.error('Submit answer error:', error);
      throw error;
    }
  }
  
  async getUserStats(userId: string) {
    try {
      const totalAttempts = await prisma.quizAttempt.count({
        where: { userId }
      });
      
      const correctAttempts = await prisma.quizAttempt.count({
        where: { userId, isCorrect: true }
      });
      
      const totalPoints = await prisma.quizAttempt.aggregate({
        where: { userId },
        _sum: { pointsEarned: true }
      });
      
      return {
        totalAttempts,
        correctAttempts,
        incorrectAttempts: totalAttempts - correctAttempts,
        accuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0,
        totalPointsEarned: totalPoints._sum.pointsEarned || 0
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      throw new Error('Failed to get user stats');
    }
  }
  
  // Admin functions
  async createQuiz(data: {
    question: string;
    answer: boolean;
    difficulty?: string;
    points?: number;
  }) {
    try {
      const quiz = await prisma.quiz.create({
        data: {
          question: data.question,
          answer: data.answer,
          difficulty: data.difficulty || 'easy',
          points: data.points || 1
        }
      });
      
      return quiz;
    } catch (error) {
      console.error('Create quiz error:', error);
      throw new Error('Failed to create quiz');
    }
  }
  
  async updateQuiz(quizId: string, data: Partial<{
    question: string;
    answer: boolean;
    difficulty: string;
    points: number;
    isActive: boolean;
  }>) {
    try {
      const quiz = await prisma.quiz.update({
        where: { id: quizId },
        data
      });
      
      return quiz;
    } catch (error) {
      console.error('Update quiz error:', error);
      throw new Error('Failed to update quiz');
    }
  }
  
  async deleteQuiz(quizId: string) {
    try {
      await prisma.quiz.update({
        where: { id: quizId },
        data: { isActive: false }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Delete quiz error:', error);
      throw new Error('Failed to delete quiz');
    }
  }
  
  async getAllQuizzes(page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const [quizzes, total] = await Promise.all([
        prisma.quiz.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.quiz.count()
      ]);
      
      return {
        quizzes,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Get all quizzes error:', error);
      throw new Error('Failed to get quizzes');
    }
  }
}

export const quizService = new QuizService();
