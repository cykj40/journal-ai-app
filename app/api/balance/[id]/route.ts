import { generateBalanceInsight } from '@/utils/ai'
import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { entryAnalysis, healthMetrics } from '@/utils/schema'
import { and, desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const maxDuration = 60

export const POST = async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const user = await getCurrentAppUser()

    const recentMetrics = await db
        .select()
        .from(healthMetrics)
        .where(eq(healthMetrics.userId, user.id))
        .orderBy(desc(healthMetrics.createdAt))
        .limit(7)

    const balance = await generateBalanceInsight(recentMetrics as Array<Record<string, unknown>>)

    const [savedAnalysis] = await db
        .update(entryAnalysis)
        .set({
            balanceScore: balance.score.toString(),
            coachingInsight: balance.insight,
            coachingRecommendation: balance.recommendation,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(entryAnalysis.entryId, id),
                eq(entryAnalysis.userId, user.id)
            )
        )
        .returning()

    if (!savedAnalysis) {
        return NextResponse.json({ error: 'Analysis not found' }, { status: 404 })
    }

    return NextResponse.json({ data: savedAnalysis })
}
