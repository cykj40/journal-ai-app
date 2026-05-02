import { qa } from '@/utils/ai'
import { findSimilarEntries } from '@/utils/embeddings'
import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
    const { question } = await request.json()
    const user = await getCurrentAppUser()

    let similar: string[] = []
    try {
        similar = await findSimilarEntries(question, user.id, 10)
    } catch {
        similar = []
    }

    const entries = similar.length === 0
        ? await db
            .select()
            .from(journalEntries)
            .where(eq(journalEntries.userId, user.id))
        : []

    const answer = await qa(question, entries, similar)

    return NextResponse.json({ data: answer })
}
