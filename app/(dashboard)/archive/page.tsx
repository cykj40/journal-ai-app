import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'

const getArchivedEntries = async () => {
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

const groupEntriesByMonth = (entries: any[]) => {
    return entries.reduce((acc, entry) => {
        const date = new Date(entry.createdAt)
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })

        if (!acc[monthYear]) {
            acc[monthYear] = []
        }
        acc[monthYear].push(entry)
        return acc
    }, {})
}

const ArchivePage = async () => {
    const entries = await getArchivedEntries()
    const entriesByMonth = groupEntriesByMonth(entries)

    return (
        <div className="px-6 py-8 bg-zinc-100/50 h-full">
            <h1 className="text-4xl mb-12">Past Entries</h1>
            <div className="space-y-8">
                {Object.entries(entriesByMonth).map(([monthYear, monthEntries]) => (
                    <div key={monthYear}>
                        <h2 className="text-2xl font-semibold mb-4">{monthYear}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(monthEntries as any[]).map((entry) => (
                                <Link key={entry.id} href={`/journal/${entry.id}`}>
                                    <EntryCard entry={entry} />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ArchivePage 