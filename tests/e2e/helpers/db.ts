/**
 * Database cleanup helper — runs in Node (global teardown), not in a browser context.
 * Requires DATABASE_URL to be set in .env.local.
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

export async function deleteTestEntries() {
  const { neon } = await import('@neondatabase/serverless')
  const { drizzle } = await import('drizzle-orm/neon-http')
  const { journalEntries, entryAnalysis, users } = await import('../../../utils/schema')
  const { eq, like } = await import('drizzle-orm')

  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql)

  // Find test users by email pattern
  const testUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(like(users.email, '%playwright@journalai%'))

  for (const user of testUsers) {
    const entries = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id))

    for (const entry of entries) {
      // entryAnalysis has ON DELETE CASCADE, but be explicit
      await db
        .delete(entryAnalysis)
        .where(eq(entryAnalysis.entryId, entry.id))
    }

    await db
      .delete(journalEntries)
      .where(eq(journalEntries.userId, user.id))
  }

  console.log(`[teardown] cleaned up test data for ${testUsers.length} test user(s)`)
}
