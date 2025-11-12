import { PrismaClient } from '@prisma/client';

// Create a single shared Prisma instance
export const prisma = new PrismaClient();

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
