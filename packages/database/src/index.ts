// @lapancomido/database
// Re-export Prisma client and types

export { prisma, default as prismaClient } from './client.js'

// Re-export all Prisma types for convenience
export * from './generated/client/index.js'

// Export version for debugging
export const DATABASE_VERSION = '1.0.0'
