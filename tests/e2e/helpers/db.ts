/**
 * Database cleanup helper — runs in Node (global teardown), not in a browser context.
 * Requires DATABASE_URL to be set in .env.local.
 *
 * Uses raw SQL via @neondatabase/serverless instead of importing utils/schema.ts —
 * Node's loader cannot compile the .ts schema file at runtime, which crashed teardown.
 */
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

export async function deleteTestEntries() {
  const { neon } = await import('@neondatabase/serverless')
  const sql = neon(process.env.DATABASE_URL!)

  const testUsers = (await sql`
    SELECT id FROM users WHERE email LIKE '%playwright@journalai%'
  `) as Array<{ id: string }>

  for (const user of testUsers) {
    const entries = (await sql`
      SELECT id FROM journal_entries WHERE user_id = ${user.id}
    `) as Array<{ id: string }>

    for (const entry of entries) {
      await sql`DELETE FROM entry_analysis WHERE entry_id = ${entry.id}`
    }

    await sql`DELETE FROM journal_entries WHERE user_id = ${user.id}`
  }

  console.log(`[teardown] cleaned up test data for ${testUsers.length} test user(s)`)
}
