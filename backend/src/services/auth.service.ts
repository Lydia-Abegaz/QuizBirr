import { generateOTP, getOTPExpiry, isOTPExpired, generateReferralCode } from '../utils/otp';
import { generateToken } from '../utils/jwt';
import { smsProvider } from '../utils/sms';
import { ledgerService } from './ledger.service';
import { prisma } from '../lib/prisma';

export class AuthService {
  

  async sendOTP(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = getOTPExpiry();
      
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { phoneNumber }
      });
      
      if (!user) {
        // Create new user
        const referralCode = generateReferralCode();
        user = await prisma.user.create({
          data: {
            phoneNumber,
            otp,
            otpExpiry,
            referralCode
          }
        });
        // Ensure user wallet account exists
        await ledgerService.ensureUserWallet(user.id);
      } else {
        // Update existing user's OTP
        await prisma.user.update({
          where: { id: user.id },
          data: { otp, otpExpiry }
        });
      }
      
      // Send OTP via SMS
      const sent = await smsProvider.sendOTP(phoneNumber, otp);
      
      if (!sent) {
        return { success: false, message: 'Failed to send OTP' };
      }
      
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw new Error('Failed to send OTP');
    }
  }
  
  async verifyOTP(phoneNumber: string, otp: string): Promise<{
    success: boolean;
    token?: string;
    user?: any;
    message?: string;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { phoneNumber }
      });
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      
      if (!user.otp || !user.otpExpiry) {
        return { success: false, message: 'No OTP found. Please request a new one.' };
      }
      
      if (isOTPExpired(user.otpExpiry)) {
        return { success: false, message: 'OTP has expired' };
      }
      
      if (user.otp !== otp) {
        return { success: false, message: 'Invalid OTP' };
      }
      
      // Mark user as verified and clear OTP
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          otp: null,
          otpExpiry: null,
          lastLogin: new Date()
        },
        select: {
          id: true,
          phoneNumber: true,
          balance: true,
          points: true,
          referralCode: true,
          role: true,
          isVerified: true
        }
      });
      // Ensure user wallet exists (idempotent)
      await ledgerService.ensureUserWallet(updatedUser.id);
      
      // Generate JWT token
      const token = generateToken({
        userId: updatedUser.id,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role
      });
      
      return {
        success: true,
        token,
        user: updatedUser
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw new Error('Failed to verify OTP');
    }
  }
  
  

  async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          phoneNumber: true,
          balance: true,
          points: true,
          referralCode: true,
          isVerified: true,
          createdAt: true,
          lastLogin: true,
          role: true
        }
      });
      
      return user;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw new Error('Failed to get user profile');
    }
  }
}

export const authService = new AuthService();
