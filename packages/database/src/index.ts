// @lapancomido/database - ESM entry point (Prisma 7)
export { prisma, default as prismaClient } from './client.js';

// Re-export all Prisma types for convenience
export * from './generated/prisma/client.js';

// Export version for debugging
export const DATABASE_VERSION = '2.0.0';
