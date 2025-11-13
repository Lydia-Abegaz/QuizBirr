import { Request, Response, NextFunction } from 'express';
import { fraudDetectionService } from '../services/fraudDetection.service';
import { logSecurityEvent } from '../utils/logger';

/**
 * Enhanced security middleware
 */
export const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authReq = req as any;
    
    // Log all requests for security monitoring
    logSecurityEvent('api_request', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      userId: authReq.user?.userId
    }, 'low');

    // Run fraud detection for authenticated users
    if (authReq.user?.userId) {
      const deviceId = req.get('X-Device-ID');
      const alerts = await fraudDetectionService.runFraudCheck(authReq.user.userId, deviceId);
      
      if (alerts.length > 0) {
        const criticalAlerts = alerts.filter(a => a.severity === 'critical');
        
        if (criticalAlerts.length > 0) {
          logSecurityEvent('critical_fraud_alert', {
            userId: authReq.user.userId,
            alerts: criticalAlerts,
            ip: req.ip
          }, 'critical');
          
          return res.status(403).json({
            error: 'Account temporarily restricted due to suspicious activity',
            code: 'FRAUD_DETECTED'
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Security middleware error:', error);
    next();
  }
};

/**
 * Device fingerprinting middleware
 */
export const deviceFingerprint = (req: Request, res: Response, next: NextFunction) => {
  const deviceId = req.get('X-Device-ID');
  const userAgent = req.get('User-Agent');
  const acceptLanguage = req.get('Accept-Language');
  
  if (!deviceId && userAgent) {
    // Generate device fingerprint from available headers
    const fingerprint = Buffer.from(`${userAgent}:${acceptLanguage}:${req.ip}`).toString('base64');
    req.headers['x-device-id'] = fingerprint;
  }
  
  next();
};

/**
 * Suspicious activity detector
 */
export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as any;
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot|crawler|spider/i.test(req.get('User-Agent') || ''),
    req.path.includes('..'),
    req.path.includes('<script>'),
    Object.keys(req.query).some(key => key.length > 100),
  ];

  if (suspiciousPatterns.some(pattern => pattern)) {
    logSecurityEvent('suspicious_request', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      query: req.query,
      userId: authReq.user?.userId
    }, 'medium');
  }

  next();
};
