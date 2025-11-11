import { PrismaClient } from '@prisma/client';
import { generateReferralCode } from '../src/utils/otp';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminPhone = '+251911000000'; // Change this to your desired admin phone
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { phoneNumber: adminPhone }
    });

    if (existingAdmin) {
      // Update existing user to admin
      const updatedUser = await prisma.user.update({
        where: { phoneNumber: adminPhone },
        data: {
          role: 'admin',
          isVerified: true,
          balance: 1000.00, // Give admin some balance
          points: 500       // Give admin some points
        }
      });
      console.log('✅ Updated existing user to admin:', updatedUser);
    } else {
      // Create new admin user
      const adminUser = await prisma.user.create({
        data: {
          phoneNumber: adminPhone,
          role: 'admin',
          isVerified: true,
          referralCode: generateReferralCode(),
          balance: 1000.00,
          points: 500
        }
      });
      console.log('✅ Created new admin user:', adminUser);
    }

    // Also create a regular test user
    const testPhone = '+251912345678';
    const existingTest = await prisma.user.findUnique({
      where: { phoneNumber: testPhone }
    });

    if (!existingTest) {
      const testUser = await prisma.user.create({
        data: {
          phoneNumber: testPhone,
          role: 'user',
          isVerified: true,
          referralCode: generateReferralCode(),
          balance: 100.00,
          points: 50
        }
      });
      console.log('✅ Created test user:', testUser);
    }

    console.log('\n🎉 Setup complete!');
    console.log('Admin phone:', adminPhone);
    console.log('Test user phone:', testPhone);
    console.log('\nYou can now login with these numbers using OTP: 123456');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
