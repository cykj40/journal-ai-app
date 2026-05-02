import { generateEmbedding } from '@/utils/embeddings'
import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries } from '@/utils/schema'
import { and, eq } from 'drizzle-orm'
import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const sql = neon(process.env.DATABASE_URL!)

export const POST = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const user = await getCurrentAppUser()

    const [entry] = await db
        .select({ content: journalEntries.content })
        .from(journalEntries)
        .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
        .limit(1)

    if (!entry) {
        return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    const embedding = await generateEmbedding(entry.content)
    const vectorLiteral = `[${embedding.join(',')}]`

    await sql(`DELETE FROM vector_entries WHERE entry_id = $1`, [id])
    await sql(
        `INSERT INTO vector_entries (id, entry_id, content, embedding) VALUES ($1, $2, $3, $4::vector)`,
        [id, id, entry.content, vectorLiteral]
    )

    return NextResponse.json({ success: true })
}
