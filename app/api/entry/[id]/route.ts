import { update } from '@/utils/actions'
import { analyzeEntry } from '@/utils/ai'
import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const DELETE = async (request: Request, { params }: { params: { id: string } }) => {
    const user = await getUserFromClerkID()

    await db
        .delete(journalEntries)
        .where(
            and(
                eq(journalEntries.id, params.id),
                eq(journalEntries.userId, user.id)
            )
        )

    update(['/journal'])

    return NextResponse.json({ data: { id: params.id } })
}

export const PATCH = async (request: Request, { params }: { params: { id: string } }) => {
    const { updates } = await request.json()
    const user = await getUserFromClerkID()

    const [entry] = await db
        .update(journalEntries)
        .set(updates)
        .where(
            and(
                eq(journalEntries.id, params.id),
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