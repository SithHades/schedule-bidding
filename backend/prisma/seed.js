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