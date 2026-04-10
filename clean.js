const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  const users = await prisma.user.findMany();
  for (const u of users) {
    if (u.name.length > 255) {
      await prisma.user.delete({ where: { id: u.id } });
      console.log(`Deleted user ${u.id} with name > 255`);
    }
  }
}
clean().then(() => prisma.$disconnect());
