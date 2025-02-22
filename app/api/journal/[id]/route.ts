import { NextRequest, NextResponse } from 'next/server'
import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromClerkID()

        const [entry] = await db
            .select()
            .from(journalEntries)
            .where(
                and(
                    eq(journalEntries.id, params.id),
                    eq(journalEntries.userId, user.id)
                )
            )

        if (!entry) {
            return NextResponse.json(
                { error: 'Entry not found or unauthorized' },
                { status: 404 }
            )
        }

        const [analysis] = await db
            .select()
            .from(entryAnalysis)
            .where(eq(entryAnalysis.entryId, entry.id))

        const data = {
            id: entry.id,
            content: entry.content,
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
            userId: entry.userId,
            status: entry.status,
            analysis: {
                mood: analysis?.mood || '',
                subject: analysis?.subject || '',
                negative: analysis?.negative || false,
                summary: analysis?.summary || '',
                color: analysis?.color || '#0101fe',
                sentimentScore: analysis ? parseFloat(analysis.sentimentScore) : 0
            }
        }

        return NextResponse.json({ data })
    } catch (error) {
        console.error('Error fetching journal entry:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromClerkID()
        const { content } = await request.json()

        if (!content) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            )
        }

        const [updatedEntry] = await db
            .update(journalEntries)
            .set({
                content,
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(journalEntries.id, params.id),
                    eq(journalEntries.userId, user.id)
                )
            )
            .returning()

        if (!updatedEntry) {
            return NextResponse.json(
                { error: 'Entry not found or unauthorized' },
                { status: 404 }
            )
        }

        return NextResponse.json({ data: updatedEntry })
    } catch (error) {
        console.error('Error updating journal entry:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 