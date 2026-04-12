import { update } from '@/utils/actions'
import { analyzeEntry } from '@/utils/ai'
import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const user = await getCurrentAppUser()

    await db
        .delete(journalEntries)
        .where(
            and(
                eq(journalEntries.id, id),
                eq(journalEntries.userId, user.id)
            )
        )

    update(['/journal'])

    return NextResponse.json({ data: { id } })
}

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const { updates } = await request.json()
    const user = await getCurrentAppUser()

    const [entry] = await db
        .update(journalEntries)
        .set(updates)
        .where(
            and(
                eq(journalEntries.id, id),
                eq(journalEntries.userId, user.id)
            )
        )
        .returning()

    const analysis = await analyzeEntry(entry)

    // Delete existing analysis if it exists
    await db
        .delete(entryAnalysis)
        .where(eq(entryAnalysis.entryId, entry.id))

    // Create new analysis
    const [savedAnalysis] = await db
        .insert(entryAnalysis)
        .values({
            entryId: entry.id,
            userId: user.id,
            mood: analysis.mood,
            subject: analysis.subject,
            negative: analysis.negative,
            summary: analysis.summary,
            color: analysis.color,
            sentimentScore: analysis.sentimentScore.toString()
        })
        .returning()

    update(['/journal'])

    return NextResponse.json({ data: { ...entry, analysis: savedAnalysis } })
}
