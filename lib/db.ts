// E:\Competitive Intelligence\Nano\ai-image-app\lib\db.ts
import { PrismaClient } from '@prisma/client';

// Re-use the client in dev to avoid opening too many DB connections
const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // You already set pgbouncer flags in DATABASE_URL for prod; this is fine for dev too
    // log: ['query'], // (optional) uncomment to see SQL in the terminal
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
