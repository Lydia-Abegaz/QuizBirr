import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async sendOTP(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return errorResponse(res, 'Phone number is required', 400);
      }
      
      const result = await authService.sendOTP(phoneNumber);
      
      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }
      
      return successResponse(res, null, result.message);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to send OTP', 500);
    }
  }
  
  async verifyOTP(req: Request, res: Response) {
    try {
      const { phoneNumber, otp } = req.body;
      
      if (!phoneNumber || !otp) {
        return errorResponse(res, 'Phone number and OTP are required', 400);
      }
      
      const result = await authService.verifyOTP(phoneNumber, otp);
      
      if (!result.success) {
        return errorResponse(res, result.message || 'Verification failed', 400);
      }
      
      return successResponse(res, {
        token: result.token,
        user: result.user
      }, 'Login successful');
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to verify OTP', 500);
    }
  }
  
  

  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return errorResponse(res, 'Unauthorized', 401);
      }
      
      const user = await authService.getUserProfile(req.user.userId);
      
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }
      
      return successResponse(res, user);
    } catch (error: any) {
      return errorResponse(res, error.message || 'Failed to get profile', 500);
    }
  }
}

export const authController = new AuthController();
