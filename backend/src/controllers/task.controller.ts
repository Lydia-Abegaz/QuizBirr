import { Response } from 'express';
import { taskService } from '../services/task.service';
import { referralService } from '../services/referral.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class TaskController {
  async getActiveTasks(req: AuthRequest, res: Response) {
    try {
      const tasks = await taskService.getActiveTasks();
      
      return successResponse(res, tasks);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get tasks', 500);
    }
  }
  
  async getTaskById(req: AuthRequest, res: Response) {
    try {
      const { taskId } = req.params;
      
      const task = await taskService.getTaskById(taskId);
      
      return successResponse(res, task);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get task', 500);
    }
  }
  
  async submitTask(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const { taskId, proof } = req.body;
      
      if (!taskId) {
        return errorResponse(res, 'Task ID is required', 400);
      }
      
      const submission = await taskService.submitTask(req.user.userId, taskId, proof);
      
      return successResponse(res, submission, 'Task submitted successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to submit task', 500);
    }
  }
  
  async getUserSubmissions(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const submissions = await taskService.getUserSubmissions(req.user.userId);
      
      return successResponse(res, submissions);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get submissions', 500);
    }
  }
  
  // Admin endpoints
  async reviewTaskSubmission(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const { submissionId } = req.params;
      const { approved, rejectionReason } = req.body;
      
      if (typeof approved !== 'boolean') {
        return errorResponse(res, 'Approved status is required', 400);
      }
      
      const result = await taskService.reviewTaskSubmission(
        submissionId,
        req.user.userId,
        approved,
        rejectionReason
      );
      
      // If approved, check if this is the user's first approved task and award referral bonus
      if (approved && result.submission) {
        try {
          await referralService.awardReferralBonus(result.submission.userId);
        } catch (error) {
          console.error('Failed to award referral bonus:', error);
        }
      }
      
      return successResponse(res, result, `Task ${approved ? 'approved' : 'rejected'} successfully`);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to review task', 500);
    }
  }
  
  async getPendingSubmissions(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await taskService.getPendingSubmissions(page, limit);
      
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get pending submissions', 500);
    }
  }
  
  async createTask(req: AuthRequest, res: Response) {
    try {
      const { title, description, type, reward, metadata } = req.body;
      
      if (!title || !type || reward === undefined) {
        return errorResponse(res, 'Title, type, and reward are required', 400);
      }
      
      const task = await taskService.createTask({
        title,
        description,
        type,
        reward,
        metadata
      });
      
      return successResponse(res, task, 'Task created successfully', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to create task', 500);
    }
  }
  
  async updateTask(req: AuthRequest, res: Response) {
    try {
      const { taskId } = req.params;
      const updateData = req.body;
      
      const task = await taskService.updateTask(taskId, updateData);
      
      return successResponse(res, task, 'Task updated successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to update task', 500);
    }
  }
  
  async deleteTask(req: AuthRequest, res: Response) {
    try {
      const { taskId } = req.params;
      
      await taskService.deleteTask(taskId);
      
      return successResponse(res, null, 'Task deleted successfully');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to delete task', 500);
    }
  }
  
  async getAllTasks(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await taskService.getAllTasks(page, limit);
      
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get tasks', 500);
    }
  }
}

export const taskController = new TaskController();
