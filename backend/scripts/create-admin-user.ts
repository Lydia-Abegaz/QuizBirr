import { PrismaClient } from '@prisma/client';
import { generateReferralCode } from '../src/utils/otp';
import { ledgerService } from '../src/services/ledger.service';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...');
    
    // You can change this phone number to your preferred admin phone
    const adminPhone = '+251911000000';
    
    // Check if admin already exists
    let adminUser = await prisma.user.findUnique({
      where: { phoneNumber: adminPhone }
    });

    if (adminUser) {
      console.log('👤 Admin user already exists, updating role...');
      // Update existing user to admin
      adminUser = await prisma.user.update({
        where: { phoneNumber: adminPhone },
        data: {
          role: 'admin',
          isVerified: true,
          balance: 1000.00,
          points: 500
        }
      });
    } else {
      console.log('👤 Creating new admin user...');
      // Create new admin user
      adminUser = await prisma.user.create({
        data: {
          phoneNumber: adminPhone,
          role: 'admin',
          isVerified: true,
          referralCode: generateReferralCode(),
          balance: 1000.00,
          points: 500
        }
      });
    }

    // Ensure admin has a wallet account
    await ledgerService.ensureUserWallet(adminUser.id);
    
    console.log('✅ Admin user created/updated:', {
      id: adminUser.id,
      phoneNumber: adminUser.phoneNumber,
      role: adminUser.role,
      balance: adminUser.balance,
      points: adminUser.points
    });

    console.log('\n🎉 Admin setup complete!');
    console.log('📱 Admin phone number:', adminPhone);
    console.log('🔐 Login process:');
    console.log('  1. Go to your app login page');
    console.log('  2. Enter phone number:', adminPhone);
    console.log('  3. Request OTP (will be printed in console)');
    console.log('  4. Enter the OTP to login');
    console.log('  5. Access admin panel at /admin');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
