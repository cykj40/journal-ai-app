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
            color: entry.entry_analysis.color || '#5C7A52',
            sentimentScore: parseFloat(entry.entry_analysis.sentimentScore)
        } : {
            mood: '',
            subject: '',
            negative: false,
            summary: '',
            color: '#5C7A52',
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

    const now = new Date()
    const greeting = (() => {
        const hour = now.getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    })()
    const dateLabel = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    return (
        <div className="px-6 pt-6 pb-4 lg:max-w-3xl lg:mx-auto overflow-y-auto">
            {/* Greeting */}
            <div className="mb-8">
                <h1
                    className="text-3xl font-semibold text-forest leading-tight"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    {greeting}
                </h1>
                <p
                    className="text-forest-muted text-sm mt-1"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                    {dateLabel}
                </p>
            </div>

            {/* Month section header */}
            <div className="flex items-center gap-3 mb-5">
                <span
                    className="text-xs font-semibold text-forest-muted tracking-widest uppercase shrink-0"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                    {monthLabel}
                </span>
                <div className="flex-1 h-px bg-sage-light" />
            </div>

            {/* Entries */}
            {entries.length === 0 ? (
                <div className="mt-16 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center">
                        <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <p
                        className="text-sm text-forest-muted text-center"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                        No entries this month yet.
                        <br />Tap + to write your first one.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {groups.map(({ dayLabel, entries: dayEntries }) => (
                        <div key={dayLabel} className="space-y-3">
                            {dayEntries.length > 1 && (
                                <div className="flex items-center gap-2 pt-2">
                                    <span
                                        className="text-[11px] text-forest-muted/70 font-medium tracking-wide shrink-0"
                                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                                    >
                                        {dayLabel}
                                    </span>
                                    <div className="flex-1 h-px bg-sage-light/60" />
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

            <NewEntry />
        </div>
    )
}

export default JournalPage
