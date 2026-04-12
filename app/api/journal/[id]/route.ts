import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentAppUser()

        const [entry] = await db
            .select()
            .from(journalEntries)
            .where(
                and(
                    eq(journalEntries.id, id),
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
            healthSnapshot: entry.healthSnapshot ?? undefined,
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentAppUser()
        const body = await request.json()
        const { content, healthSnapshot } = body

        if (content === undefined && healthSnapshot === undefined) {
            return NextResponse.json(
                { error: 'content or healthSnapshot is required' },
                { status: 400 }
            )
        }

        const [updatedEntry] = await db
            .update(journalEntries)
            .set({
                ...(content !== undefined && { content }),
                ...(healthSnapshot !== undefined && { healthSnapshot }),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(journalEntries.id, id),
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
