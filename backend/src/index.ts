import { app, env } from './app';
import { prisma } from './lib/prisma';

// Initialize database connection
const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Start the application
const start = async () => {
  try {
    await initializeDatabase();
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
