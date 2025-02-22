import { NextRequest, NextResponse } from 'next/server'
import { getUserFromClerkID } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis } from '@/utils/schema'
import { eq, and, between, desc } from 'drizzle-orm'

type AnalyticsData = Awaited<ReturnType<typeof db.select>>

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const startDate = new Date(searchParams.get('startDate') || '')
        const endDate = new Date(searchParams.get('endDate') || '')
        const comparison = searchParams.get('comparison')

        const user = await getUserFromClerkID()

        // Get current period data
        const currentPeriodData = await db
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

        // If comparison is requested, get previous period data
        let previousPeriodData: AnalyticsData = []
        if (comparison && comparison !== 'none') {
            const duration = endDate.getTime() - startDate.getTime()
            const previousStartDate = new Date(startDate.getTime() - duration)
            const previousEndDate = new Date(endDate.getTime() - duration)

            previousPeriodData = await db
                .select()
                .from(journalEntries)
                .leftJoin(
                    entryAnalysis,
                    eq(journalEntries.id, entryAnalysis.entryId)
                )
                .where(
                    and(
                        eq(journalEntries.userId, user.id),
                        between(journalEntries.createdAt, previousStartDate, previousEndDate)
                    )
                )
                .orderBy(desc(journalEntries.createdAt))
        }

        return NextResponse.json({
            currentPeriod: currentPeriodData,
            previousPeriod: previousPeriodData,
        })
    } catch (error) {
        console.error('Error fetching analytics data:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        )
    }
} 