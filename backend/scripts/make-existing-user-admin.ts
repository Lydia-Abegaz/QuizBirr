import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeExistingUserAdmin() {
  try {
    // Change this to the phone number of the user you want to make admin
    const phoneNumber = '+251912345678'; // Replace with actual phone number
    
    console.log(`🔧 Making user ${phoneNumber} an admin...`);
    
    const user = await prisma.user.findUnique({
      where: { phoneNumber }
    });
    
    if (!user) {
      console.log('❌ User not found with phone number:', phoneNumber);
      console.log('Available users:');
      const users = await prisma.user.findMany({
        select: { phoneNumber: true, role: true, isVerified: true }
      });
      users.forEach(u => console.log(`  - ${u.phoneNumber} (${u.role})`));
      return;
    }
    
    const updatedUser = await prisma.user.update({
      where: { phoneNumber },
      data: {
        role: 'admin',
        isVerified: true,
        balance: 1000.00,
        points: 500
      }
    });
    
    console.log('✅ User updated to admin:', {
      phoneNumber: updatedUser.phoneNumber,
      role: updatedUser.role,
      balance: updatedUser.balance,
      points: updatedUser.points
    });
    
    console.log(`\n🎉 ${phoneNumber} is now an admin!`);
    console.log('You can login with this number and access /admin');
    
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeExistingUserAdmin();
