// import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
// import { errorResponse } from '../utils/response';

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 400, errors.array());
  }
  next();
};

// Phone number validation (Ethiopian format)
export const validatePhoneNumber = body('phoneNumber')
  .matches(/^(\+251|0)[79]\d{8}$/)
  .withMessage('Invalid Ethiopian phone number format');

// OTP validation
export const validateOTP = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be 6 digits');

// Amount validation
export const validateAmount = body('amount')
  .isFloat({ min: 0.01, max: 100000 })
  .withMessage('Amount must be between 0.01 and 100,000');

// Quiz answer validation
export const validateQuizAnswer = [
  body('quizId').isUUID().withMessage('Invalid quiz ID'),
  body('answer').isBoolean().withMessage('Answer must be true or false')
];

// Task submission validation
export const validateTaskSubmission = [
  body('taskId').isUUID().withMessage('Invalid task ID'),
  body('proof').optional().isString().isLength({ max: 500 }).withMessage('Proof must be a string with max 500 characters')
];

// Withdrawal validation
export const validateWithdrawal = [
  validateAmount,
  body('amount').custom((value) => {
    if (value < 10) {
      throw new Error('Minimum withdrawal amount is 10 Birr');
    }
    return true;
  })
];

// Deposit validation
export const validateDeposit = [
  validateAmount,
  body('method').isIn(['telebirr', 'bank', 'chapa']).withMessage('Invalid payment method')
];

// Mystery box validation
export const validateMysteryBox = [
  body('pointsToSpend')
    .isInt({ min: 50, max: 10000 })
    .withMessage('Points must be between 50 and 10,000')
];

// Admin task creation validation
export const validateTaskCreation = [
  body('title').isString().isLength({ min: 3, max: 100 }).withMessage('Title must be 3-100 characters'),
  body('description').optional().isString().isLength({ max: 500 }).withMessage('Description max 500 characters'),
  body('type').isIn(['watch_ad', 'subscribe', 'upload_photo', 'join_link', 'social_follow', 'app_download'])
    .withMessage('Invalid task type'),
  body('reward').isFloat({ min: 0, max: 1000 }).withMessage('Reward must be between 0 and 1000')
];

// Admin quiz creation validation
export const validateQuizCreation = [
  body('question').isString().isLength({ min: 10, max: 500 }).withMessage('Question must be 10-500 characters'),
  body('answer').isBoolean().withMessage('Answer must be true or false'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('points').isInt({ min: 1, max: 100 }).withMessage('Points must be between 1 and 100')
];

// Referral code validation
export const validateReferralCode = body('referralCode')
  .isString()
  .isLength({ min: 6, max: 12 })
  .isAlphanumeric()
  .withMessage('Invalid referral code format');

// Pagination validation
export const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
];

// UUID parameter validation
export const validateUUIDParam = (paramName: string) => 
  param(paramName).isUUID().withMessage(`Invalid ${paramName} format`);

// Sanitization middleware
export const sanitizeInput = [
  body('*').trim().escape(), // Trim whitespace and escape HTML
  query('*').trim().escape()
];

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const file = (req as any).file;
  
  if (!file) {
    return errorResponse(res, 'No file uploaded', 400);
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return errorResponse(res, 'File size must be less than 5MB', 400);
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return errorResponse(res, 'Invalid file type. Only JPEG, PNG, and PDF allowed', 400);
  }

  next();
};

// IP validation and security
export const validateIP = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Log suspicious IPs (you can add IP blacklist logic here)
  if (clientIP && (clientIP.includes('127.0.0.1') || clientIP.includes('localhost'))) {
    // Allow localhost for development
    return next();
  }
  
  // Add any IP-based security checks here
  next();
};

// Request size validation
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('content-length');
  
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return errorResponse(res, 'Request too large', 413);
  }
  
  next();
};
