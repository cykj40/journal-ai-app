import { type Entry } from '@/utils/types'
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
            color: entry.entry_analysis.color || '#0101fe',
            sentimentScore: parseFloat(entry.entry_analysis.sentimentScore)
        } : {
            mood: '',
            subject: '',
            negative: false,
            summary: '',
            color: '#0101fe',
            sentimentScore: 0
        }
    })) as Entry[]
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
