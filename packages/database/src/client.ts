import { PrismaClient } from './generated/client/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Check if we should use the adapter (for Supabase pooler)
  const useAdapter = process.env.DATABASE_URL?.includes('pooler.supabase.com')

  if (useAdapter) {
    // Create connection pool for Supabase pooler
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // Create Prisma adapter
    const adapter = new PrismaPg(pool)

    return new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    })
  }

  // Standard connection (local dev or direct connection)
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
