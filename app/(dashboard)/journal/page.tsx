import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and, gte } from 'drizzle-orm'
import NewEntry from '@/components/NewEntry'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'
import AskAI from '@/components/AskAI'

const getEntries = async () => {
    const user = await getUserFromClerkID()
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    const entries = await db
        .select()
        .from(journalEntries)
        .leftJoin(
            entryAnalysis,
            eq(journalEntries.id, entryAnalysis.entryId)
        )
        .where(
            and(
                eq(journalEntries.userId, user.id),
                gte(journalEntries.createdAt, firstDayOfMonth)
            )
        )
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
            <div className="mb-8">
                <AskAI />
            </div>
            <h1 className="text-4xl mb-12">Journals</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <NewEntry />
                {entries.map((entry) => (
                    <Link key={entry.id} href={`/journal/${entry.id}`}>
                        <EntryCard entry={entry} />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default JournalPage
