import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database...\n');

    // Count all users
    const userCount = await prisma.user.count();
    console.log(`👥 Total users: ${userCount}`);

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        phoneNumber: true,
        role: true,
        isVerified: true,
        balance: true,
        points: true,
        referralCode: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('\n📋 Users in database:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.phoneNumber}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verified: ${user.isVerified}`);
      console.log(`   Balance: ${user.balance} BIRR`);
      console.log(`   Points: ${user.points}`);
      console.log(`   Referral: ${user.referralCode}`);
      console.log(`   Created: ${user.createdAt.toLocaleString()}`);
      console.log(`   Last Login: ${user.lastLogin?.toLocaleString() || 'Never'}`);
    });

    // Check quiz attempts
    const quizCount = await prisma.quizAttempt.count();
    console.log(`\n🧠 Total quiz attempts: ${quizCount}`);

    // Check transactions
    const transactionCount = await prisma.transaction.count();
    console.log(`💰 Total transactions: ${transactionCount}`);

    // Check accounts
    const accountCount = await prisma.account.count();
    console.log(`🏦 Total accounts: ${accountCount}`);

    if (accountCount > 0) {
      const accounts = await prisma.account.findMany({
        include: {
          user: {
            select: { phoneNumber: true }
          }
        }
      });
      
      console.log('\n🏦 Accounts:');
      accounts.forEach(account => {
        console.log(`   ${account.type}: ${account.user?.phoneNumber || 'System'}`);
      });
    }

  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
