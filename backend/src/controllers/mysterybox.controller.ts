import { Response } from 'express';
import { mysteryBoxService } from '../services/mysterybox.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class MysteryBoxController {
  /**
   * Check if user is eligible for mystery box
   */
  async checkEligibility(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      const eligibility = await mysteryBoxService.checkEligibility(req.user.userId);
      
      return successResponse(res, eligibility);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to check eligibility', 500);
    }
  }

  /**
   * Open mystery box
   */
  async openMysteryBox(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      const { pointsToSpend } = req.body;

      if (!pointsToSpend || pointsToSpend <= 0) {
        return errorResponse(res, 'Valid points amount is required', 400);
      }

      if (pointsToSpend < 50) {
        return errorResponse(res, 'Minimum 50 points required for mystery box', 400);
      }

      const result = await mysteryBoxService.openMysteryBox(req.user.userId, pointsToSpend);
      
      return successResponse(res, result, 'Mystery box opened successfully!', 201);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to open mystery box', 500);
    }
  }

  /**
   * Get user's mystery box history
   */
  async getMysteryBoxHistory(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const history = await mysteryBoxService.getMysteryBoxHistory(req.user.userId, page, limit);
      
      return successResponse(res, history);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get mystery box history', 500);
    }
  }

  /**
   * Get user's mystery box statistics
   */
  async getMysteryBoxStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }

      const stats = await mysteryBoxService.getMysteryBoxStats(req.user.userId);
      
      return successResponse(res, stats);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get mystery box stats', 500);
    }
  }

  /**
   * Admin: Get all mystery box activity
   */
  async getAllMysteryBoxActivity(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const activity = await mysteryBoxService.getAllMysteryBoxActivity(page, limit);
      
      return successResponse(res, activity);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get mystery box activity', 500);
    }
  }
}

export const mysteryBoxController = new MysteryBoxController();
