const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if any admin users exist
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount === 0) {
      // Find the first user (oldest by creation time)
      const firstUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' }
      });

      if (firstUser) {
        // Promote first user to admin
        await prisma.user.update({
          where: { id: firstUser.id },
          data: { role: 'ADMIN' }
        });
        
        console.log(`✅ Promoted user ${firstUser.email} to admin role`);
      } else {
        console.log('ℹ️  No users found to promote to admin');
      }
    } else {
      console.log(`ℹ️  Admin users already exist (${adminCount} found)`);
    }

    // Check if any shift windows exist
    const windowCount = await prisma.shiftWindow.count();
    
    if (windowCount === 0) {
      console.log('🏗️  Creating sample shift windows...');
      
      // Create a current week shift window
      const currentDate = new Date();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      
      // Create next week shift window
      const nextWeekStart = new Date(startOfWeek);
      nextWeekStart.setDate(startOfWeek.getDate() + 7);
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);

      const currentWindow = await prisma.shiftWindow.create({
        data: {
          name: 'Current Week',
          startDate: startOfWeek,
          endDate: endOfWeek,
        }
      });

      const nextWindow = await prisma.shiftWindow.create({
        data: {
          name: 'Next Week',
          startDate: nextWeekStart,
          endDate: nextWeekEnd,
        }
      });

      console.log(`✅ Created shift window: ${currentWindow.name}`);
      console.log(`✅ Created shift window: ${nextWindow.name}`);

      // Create sample shifts for current week
      const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const shiftTypes = ['EARLY', 'LATE'];
      
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const shiftDate = new Date(startOfWeek);
        shiftDate.setDate(startOfWeek.getDate() + dayOffset);
        
        for (const shiftType of shiftTypes) {
          await prisma.shift.create({
            data: {
              date: shiftDate,
              type: shiftType,
              weight: shiftType === 'EARLY' ? 1.2 : 1.0, // Early shifts have higher weight
              shiftWindowId: currentWindow.id,
            }
          });
        }
      }

      // Create sample shifts for next week
      for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
        const shiftDate = new Date(nextWeekStart);
        shiftDate.setDate(nextWeekStart.getDate() + dayOffset);
        
        for (const shiftType of shiftTypes) {
          await prisma.shift.create({
            data: {
              date: shiftDate,
              type: shiftType,
              weight: shiftType === 'EARLY' ? 1.2 : 1.0,
              shiftWindowId: nextWindow.id,
            }
          });
        }
      }

      console.log(`✅ Created 20 sample shifts (10 per window)`);
    } else {
      console.log(`ℹ️  Shift windows already exist (${windowCount} found)`);
    }

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 