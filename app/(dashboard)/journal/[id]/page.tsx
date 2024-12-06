import Editor from '@/components/Editor'
import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'

const getEntry = async (id: string) => {
    const user = await getUserFromClerkID()

    // Get the journal entry
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

    // Get the analysis for this entry
    const [analysis] = await db
        .select()
        .from(entryAnalysis)
        .where(eq(entryAnalysis.entryId, entry.id));

    return {
        ...entry,
        analysis
    }
}

const JournalEditorPage = async ({ params }: { params: { id: string } }) => {
    const entry = await getEntry(params.id)

    return (
        <div className="w-full h-full">
            <Editor entry={entry} />
        </div>
    )
}

export default JournalEditorPage


