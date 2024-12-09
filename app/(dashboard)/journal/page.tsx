import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import NewEntry from '@/components/NewEntry'
import Link from 'next/link'

const getEntries = async () => {
    const user = await getUserFromClerkID()

    const entries = await db
        .select()
        .from(journalEntries)
        .leftJoin(
            entryAnalysis,
            eq(journalEntries.id, entryAnalysis.entryId)
        )
        .where(eq(journalEntries.userId, user.id))
        .orderBy(journalEntries.createdAt)

    return entries.map(entry => ({
        ...entry.journal_entries,
        analysis: entry.entry_analysis
    }))
}

const JournalPage = async () => {
    const entries = await getEntries()

    return (
        <div className="px-6 py-8 bg-zinc-100/50 h-full">
            <h1 className="text-4xl mb-12">Journals</h1>
            <div className="grid grid-cols-3 gap-4">
                <NewEntry />
                {entries.map((entry) => (
                    <div key={entry.id}>
                        <Link href={`/journal/${entry.id}`}>
                            {/* You'll need to create an EntryCard component */}
                            <div className="cursor-pointer overflow-hidden rounded-lg bg-white shadow p-4">
                                <p>{entry.content.slice(0, 100)}...</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default JournalPage
