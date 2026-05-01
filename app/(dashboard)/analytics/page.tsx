import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis, healthMetrics } from '@/utils/schema'
import { eq, and, between, desc } from 'drizzle-orm'
import ClientAnalytics from './client'

const getAnalyticsData = async (startDate: Date, endDate: Date) => {
    const user = await getCurrentAppUser()

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

const getHealthMetrics = async (startDate: Date, endDate: Date) => {
    const user = await getCurrentAppUser()

    const rows = await db
        .select({
            sleepQuality: healthMetrics.sleepQuality,
            stressLevel: healthMetrics.stressLevel,
            energyLevel: healthMetrics.energyLevel,
            exerciseMentioned: healthMetrics.exerciseMentioned,
            date: journalEntries.createdAt,
        })
        .from(healthMetrics)
        .innerJoin(journalEntries, eq(healthMetrics.entryId, journalEntries.id))
        .where(
            and(
                eq(healthMetrics.userId, user.id),
                between(journalEntries.createdAt, startDate, endDate)
            )
        )
        .orderBy(journalEntries.createdAt)

    return rows
}

export default async function AnalyticsPage() {
    // Default to last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    const [analyticsData, healthMetricsData] = await Promise.all([
        getAnalyticsData(startDate, endDate),
        getHealthMetrics(startDate, endDate),
    ])

    return (
        <ClientAnalytics
            initialData={analyticsData}
            healthMetrics={healthMetricsData}
            startDate={startDate}
            endDate={endDate}
        />
    )
}

