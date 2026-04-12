import { qa } from '@/utils/ai'
import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
    const { question } = await request.json()
    const user = await getCurrentAppUser()

    const entries = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, user.id))

    const answer = await qa(question, entries)

    return NextResponse.json({ data: answer })
}
