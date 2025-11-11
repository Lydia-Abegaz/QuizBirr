import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeUserAdmin() {
  try {
    // Make the most recent user (0927197935) an admin
    const phoneNumber = '0927197935';
    
    const updatedUser = await prisma.user.update({
      where: { phoneNumber },
      data: {
        role: 'admin',
        balance: 1000.00,
        points: 500
      }
    });
    
    console.log('✅ Updated user to admin:', updatedUser);
    console.log(`\n🎉 ${phoneNumber} is now an admin!`);
    console.log('You can login with this number and access the admin panel.');
    
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeUserAdmin();
