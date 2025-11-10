import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

// Simple in-memory rate limiter
// In production, use Redis for distributed rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export const rateLimit = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs
      };
      return next();
    }
    
    store[key].count++;
    
    if (store[key].count > options.maxRequests) {
      return errorResponse(res, 'Too many requests', 429);
    }
    
    next();
  };
};
