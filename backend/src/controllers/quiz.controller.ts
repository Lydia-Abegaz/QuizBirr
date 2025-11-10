import { Response } from 'express';
import { quizService } from '../services/quiz.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class QuizController {
  async getRandomQuiz(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const quiz = await quizService.getRandomQuiz(req.user.userId);
      
      if (!quiz) {
        return errorResponse(res, 'No quizzes available', 404);
      }
      
      return successResponse(res, quiz);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get quiz', 500);
    }
  }
  
  async submitAnswer(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const { quizId, answer } = req.body;
      
      if (!quizId || typeof answer !== 'boolean') {
        return errorResponse(res, 'Quiz ID and answer are required', 400);
      }
      
      const result = await quizService.submitAnswer(req.user.userId, quizId, answer);
      
      return successResponse(res, result, 'Answer submitted successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to submit answer', 500);
    }
  }
  
  async getUserStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const stats = await quizService.getUserStats(req.user.userId);
      
      return successResponse(res, stats);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get stats', 500);
    }
  }
  
  // Admin endpoints
  async createQuiz(req: AuthRequest, res: Response) {
    try {
      const { question, answer, difficulty, points } = req.body;
      
      if (!question || typeof answer !== 'boolean') {
        return errorResponse(res, 'Question and answer are required', 400);
      }
      
      const quiz = await quizService.createQuiz({
        question,
        answer,
        difficulty,
        points
      });
      
      return successResponse(res, quiz, 'Quiz created successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to create quiz', 500);
    }
  }
  
  async updateQuiz(req: AuthRequest, res: Response) {
    try {
      const { quizId } = req.params;
      const updateData = req.body;
      
      const quiz = await quizService.updateQuiz(quizId, updateData);
      
      return successResponse(res, quiz, 'Quiz updated successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to update quiz', 500);
    }
  }
  
  async deleteQuiz(req: AuthRequest, res: Response) {
    try {
      const { quizId } = req.params;
      
      await quizService.deleteQuiz(quizId);
      
      return successResponse(res, null, 'Quiz deleted successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to delete quiz', 500);
    }
  }
  
  async getAllQuizzes(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await quizService.getAllQuizzes(page, limit);
      
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get quizzes', 500);
    }
  }
}

export const quizController = new QuizController();
