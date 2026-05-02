import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { healthMetrics, entryAnalysis, journalEntries } from '@/utils/schema'
import { and, eq, gte } from 'drizzle-orm'
import PatternsClient from './client'

const getPatternData = async () => {
    const user = await getCurrentAppUser()
    const since = new Date()
    since.setDate(since.getDate() - 90)

    const metricsRows = await db
        .select()
        .from(healthMetrics)
        .leftJoin(journalEntries, eq(healthMetrics.entryId, journalEntries.id))
        .where(and(eq(healthMetrics.userId, user.id), gte(healthMetrics.date, since)))

    const analysisRows = await db
        .select()
        .from(entryAnalysis)
        .where(and(eq(entryAnalysis.userId, user.id), gte(entryAnalysis.createdAt, since)))

    return {
        healthMetrics: metricsRows.map(r => r.health_metrics),
        entryAnalysis: analysisRows,
    }
}

const PatternsPage = async () => {
    const { healthMetrics, entryAnalysis } = await getPatternData()

    return (
        <PatternsClient
            healthMetrics={healthMetrics}
            entryAnalysis={entryAnalysis}
        />
    )
}

export default PatternsPage
