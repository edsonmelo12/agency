const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const EMAIL = process.env.ADMIN_EMAIL || 'edsonmelo12@gmail.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'senha123';
const NAME = process.env.ADMIN_NAME || 'Edson Melo';
const prisma = new PrismaClient();

const run = async () => {
  try {
    await prisma.user.deleteMany({ where: { email: EMAIL } });
    const password = await bcrypt.hash(PASSWORD, 10);
    const now = new Date();
    await prisma.user.create({
      data: {
        email: EMAIL,
        name: NAME,
        password,
        role: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    });
    console.log(`usuário ${EMAIL} recriado com sucesso`);
  } catch (error) {
    console.error('falha ao recriar admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

run();
