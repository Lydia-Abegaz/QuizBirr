import { Response } from 'express';
import { referralService } from '../services/referral.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class ReferralController {
  async applyReferralCode(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const { referralCode } = req.body;
      
      if (!referralCode) {
        return errorResponse(res, 'Referral code is required', 400);
      }
      
      const result = await referralService.applyReferralCode(req.user.userId, referralCode);
      
      return successResponse(res, result, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to apply referral code', 500);
    }
  }
  
  async getReferralStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const stats = await referralService.getReferralStats(req.user.userId);
      
      return successResponse(res, stats);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get referral stats', 500);
    }
  }
  
  async getReferredUsers(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await referralService.getReferredUsers(req.user.userId, page, limit);
      
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get referred users', 500);
    }
  }
  
  async claimDailyBonus(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const result = await referralService.awardDailyLoginBonus(req.user.userId);
      
      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }
      
      return successResponse(res, result.data, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to claim daily bonus', 500);
    }
  }
}

export const referralController = new ReferralController();
