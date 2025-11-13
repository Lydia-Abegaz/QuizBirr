import { PrismaClient } from '@prisma/client';
import { telebirrService } from '../src/services/telebirr.service';
import { generateReferralCode } from '../src/utils/otp';

const prisma = new PrismaClient();

async function testMockTransactions() {
  try {
    console.log('🧪 Testing mock transactions...');
    
    // Find a user (or create one for testing)
    let user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('📝 Creating test user...');
      user = await prisma.user.create({
        data: {
          phoneNumber: '+251911123456',
          isVerified: true,
          role: 'user',
          referralCode: generateReferralCode()
        }
      });
    }
    
    console.log(`👤 Using user: ${user.id} (${user.phoneNumber})`);
    
    // Test deposit transaction
    console.log('💰 Creating mock deposit...');
    const deposit = await telebirrService.initPayment(user.id, 100);
    console.log('✅ Deposit created:', deposit);
    
    // Simulate payment confirmation (mock)
    console.log('✅ Confirming mock payment...');
    const confirmation = await telebirrService.confirmByReference(deposit.reference, {
      mockProvider: 'telebirr',
      mockTransactionId: 'MOCK_' + Date.now()
    });
    console.log('✅ Payment confirmed:', confirmation);
    
    // Check all transactions
    console.log('📊 All transactions:');
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          select: { phoneNumber: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    transactions.forEach(tx => {
      console.log(`  ${tx.type.toUpperCase()}: ${tx.amount} ETB - ${tx.status} (${tx.user.phoneNumber})`);
    });
    
    console.log('🎉 Mock transaction test completed!');
    
  } catch (error) {
    console.error('❌ Error testing transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMockTransactions();
