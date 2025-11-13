import { createLogger, format, transports } from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Create the logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.colorize({ all: true }),
    format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`,
    ),
  ),
  transports: [
    // Console transport
    new transports.Console(),
    
    // File transports
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: format.combine(
        format.timestamp(),
        format.json()
      )
    }),
  ],
});

// Create specialized loggers for different components
export const authLogger = logger.child({ service: 'auth' });
export const quizLogger = logger.child({ service: 'quiz' });
export const walletLogger = logger.child({ service: 'wallet' });
export const fraudLogger = logger.child({ service: 'fraud' });
export const paymentLogger = logger.child({ service: 'payment' });

// Security event logger
export const securityLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'security.log'),
    }),
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ],
});

// Audit logger for financial transactions
export const auditLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'audit.log'),
    }),
  ],
});

// Performance logger
export const performanceLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(process.cwd(), 'logs', 'performance.log'),
    }),
  ],
});

// Helper functions for structured logging
export const logUserAction = (userId: string, action: string, details?: any) => {
  logger.info('User action', {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logSecurityEvent = (event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  securityLogger.warn('Security event', {
    event,
    severity,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logAuditEvent = (userId: string, action: string, amount?: number, details?: any) => {
  auditLogger.info('Audit event', {
    userId,
    action,
    amount,
    details,
    timestamp: new Date().toISOString()
  });
};

export const logPerformance = (operation: string, duration: number, details?: any) => {
  performanceLogger.info('Performance metric', {
    operation,
    duration,
    details,
    timestamp: new Date().toISOString()
  });
};

export default logger;
