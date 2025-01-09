import { type Entry } from '@/utils/types'
import Editor from '@/components/Editor'
import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'

const getEntry = async (id: string) => {
    const user = await getUserFromClerkID()

    const [entry] = await db
        .select()
        .from(journalEntries)
        .where(
            and(
                eq(journalEntries.id, id),
                eq(journalEntries.userId, user.id)
            )
        );

    if (!entry) return null;

    const [analysis] = await db
        .select()
        .from(entryAnalysis)
        .where(eq(entryAnalysis.entryId, entry.id));

    return {
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
    } as Entry;
}

const JournalEditorPage = async ({ params }: { params: { id: string } }) => {
    const entry = await getEntry(params.id)

    if (!entry) {
        return <div>Entry not found</div>
    }

    return (
        <div className="w-full h-full">
            <Editor entry={entry} />
        </div>
    )
}

export default JournalEditorPage


