import { Request, Response, NextFunction } from 'express';

// Simple request size validation
export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = req.get('content-length');
  
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({ error: 'Request too large' });
  }
  
  next();
};

// Simple device fingerprinting
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

// Simple suspicious activity detector
export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot|crawler|spider/i.test(req.get('User-Agent') || ''),
    req.path.includes('..'),
    req.path.includes('<script>'),
    Object.keys(req.query).some(key => key.length > 100),
  ];

  if (suspiciousPatterns.some(pattern => pattern)) {
    console.log('Suspicious request detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
    });
  }

  next();
};
