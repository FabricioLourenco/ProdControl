import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const setupTestDB = async () => {
  await prisma.product.deleteMany();
  await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence WHERE name = "Product";');
};

export const disconnectTestDB = async () => {
  await prisma.$disconnect();
}