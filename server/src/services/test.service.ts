import { prisma } from "../utils/prisma";

export class TestService {
  static async resetDatabase() {
    await prisma.product.deleteMany();
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence WHERE name = "Product";');
  }
}