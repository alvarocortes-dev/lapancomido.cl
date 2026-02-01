// @lapancomido/database - Prisma 7 client with pg adapter
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

// Types for global singleton
declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ 
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false }
  });
  
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
