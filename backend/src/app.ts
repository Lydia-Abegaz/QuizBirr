import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';
import routes from './routes';

type EnvSchema = {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: string;
  JWT_SECRET: string;
  DATABASE_URL: string;
  FRONTEND_URL?: string;
  TELEBIRR_WEBHOOK_SECRET?: string;
};

// Load environment variables from project root .env only in development
if (process.env.NODE_ENV !== 'production') {
  config({ path: path.resolve(__dirname, '..', '..', '.env') });
}

// Validate environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  JWT_SECRET: z.string().min(10).default('your-secret-key-here-change-this-in-production-to-a-secure-random-string'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  FRONTEND_URL: z.string().optional(),
  TELEBIRR_WEBHOOK_SECRET: z.string().optional()
});

const env = envSchema.parse(process.env) as EnvSchema;

// Initialize Express app
const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://quizbirr.netlify.app',
      'https://quizzbirr.netlify.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.some(allowedOrigin => allowedOrigin && origin.includes(allowedOrigin.replace(/https?:\/\//, '')))) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all origins for now
  },
  credentials: true
}));
// Capture rawBody for webhooks (HMAC verification)
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route - friendly landing (helps browsers and simple checks)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Welcome to Swipe-Quiz API', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
const PORT = parseInt(env.PORT, 10) || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export { app, env };
