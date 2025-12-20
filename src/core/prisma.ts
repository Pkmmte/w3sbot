import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '#prisma'

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || ':memory:' })
export const prisma = new PrismaClient({ adapter })
