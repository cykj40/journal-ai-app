import { type Entry } from '@/utils/types'
import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and, gte } from 'drizzle-orm'
import NewEntry from '@/components/NewEntry'
import Link from 'next/link'
import EntryCard from '@/components/EntryCard'

const getEntries = async () => {
    const user = await getUserFromClerkID()
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

    const entries = await db
        .select()
        .from(journalEntries)
        .leftJoin(entryAnalysis, eq(journalEntries.id, entryAnalysis.entryId))
        .where(
            and(
                eq(journalEntries.userId, user.id),
                gte(journalEntries.createdAt, firstDayOfMonth)
            )
        )
        .orderBy(journalEntries.createdAt)

    return entries.map(entry => ({
        id: entry.journal_entries.id,
        content: entry.journal_entries.content,
        createdAt: entry.journal_entries.createdAt.toISOString(),
        updatedAt: entry.journal_entries.updatedAt.toISOString(),
        userId: entry.journal_entries.userId,
        status: entry.journal_entries.status,
        analysis: entry.entry_analysis ? {
            mood: entry.entry_analysis.mood,
            subject: entry.entry_analysis.subject,
            negative: entry.entry_analysis.negative,
            summary: entry.entry_analysis.summary,
            color: entry.entry_analysis.color || '#6366f1',
            sentimentScore: parseFloat(entry.entry_analysis.sentimentScore)
        } : {
            mood: '',
            subject: '',
            negative: false,
            summary: '',
            color: '#6366f1',
            sentimentScore: 0
        }
    })) as Entry[]
}

function groupByDay(entries: Entry[]): Array<{ dayLabel: string; entries: Entry[] }> {
    const map = new Map<string, Entry[]>()

    for (const entry of entries) {
        const key = new Date(entry.createdAt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
        const existing = map.get(key)
        if (existing) {
            existing.push(entry)
        } else {
            map.set(key, [entry])
        }
    }

    return Array.from(map.entries()).map(([dayLabel, entries]) => ({ dayLabel, entries }))
}

const JournalPage = async () => {
    const entries = await getEntries()
    const groups = groupByDay(entries)

    return (
        <div className="relative h-full overflow-y-auto bg-gray-50 dark:bg-zinc-950">
            <div className="mx-auto max-w-[680px] px-6 py-10">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-zinc-100 mb-6">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h1>

                {entries.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-zinc-500 mt-16 text-center">
                        No entries this month yet.
                    </p>
                ) : (
                    <div className="space-y-1">
                        {groups.map(({ dayLabel, entries: dayEntries }) => (
                            <div key={dayLabel}>
                                {/* Date divider — only shown when a day has multiple entries */}
                                {dayEntries.length > 1 && (
                                    <div className="flex items-center gap-3 px-3 py-2 mt-4 first:mt-0">
                                        <span className="text-xs font-medium text-gray-400 dark:text-zinc-500 tracking-wide">
                                            {dayLabel}
                                        </span>
                                        <div className="flex-1 h-px bg-gray-200 dark:bg-zinc-700" />
                                    </div>
                                )}

                                {dayEntries.map(entry => (
                                    <Link key={entry.id} href={`/journal/${entry.id}`}>
                                        <EntryCard entry={entry} />
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <NewEntry />
        </div>
    )
}

export default JournalPage
