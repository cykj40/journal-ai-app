import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and, between, desc } from 'drizzle-orm'
import ClientAnalytics from './client'

const getAnalyticsData = async (startDate: Date, endDate: Date) => {
    const user = await getUserFromClerkID()

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
                between(journalEntries.createdAt, startDate, endDate)
            )
        )
        .orderBy(desc(journalEntries.createdAt))

    return entries
}

export default async function AnalyticsPage() {
    // Default to last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    const analyticsData = await getAnalyticsData(startDate, endDate)

    return <ClientAnalytics initialData={analyticsData} startDate={startDate} endDate={endDate} />
} 