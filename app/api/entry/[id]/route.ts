import { update } from '@/utils/actions'
import { analyzeEntry } from '@/utils/ai'
import { getCurrentAppUser } from '@/utils/auth'
import { db } from '@/utils/db'
import { journalEntries, entryAnalysis, healthMetrics } from '@/utils/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const user = await getCurrentAppUser()

    await db
        .delete(journalEntries)
        .where(
            and(
                eq(journalEntries.id, id),
                eq(journalEntries.userId, user.id)
            )
        )

    update(['/journal'])

    return NextResponse.json({ data: { id } })
}

export const PATCH = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    const { updates } = await request.json()
    const user = await getCurrentAppUser()

    const [entry] = await db
        .update(journalEntries)
        .set(updates)
        .where(
            and(
                eq(journalEntries.id, id),
                eq(journalEntries.userId, user.id)
            )
        )
        .returning()

    const analysis = await analyzeEntry(entry)

    // Write to health_metrics first so the balance insight can read this entry's row
    await db.delete(healthMetrics).where(eq(healthMetrics.entryId, entry.id))

    await db.insert(healthMetrics).values({
        entryId: entry.id,
        userId: user.id,
        date: entry.createdAt,
        moodStability: analysis.moodStability,
        anxietyLevel: analysis.anxietyLevel?.toString() ?? null,
        motivationLevel: analysis.motivationLevel?.toString() ?? null,
        gratitudeMentioned: analysis.gratitudeMentioned,
        socialConnection: analysis.socialConnection,
        energyLevel: analysis.energyLevel?.toString() ?? null,
        stressLevel: analysis.stressLevel?.toString() ?? null,
        workStress: analysis.workStress,
        workStressSeverity: analysis.workStressSeverity?.toString() ?? null,
        sleepQuality: analysis.sleepQuality?.toString() ?? null,
        exerciseMentioned: analysis.exerciseMentioned,
        exerciseType: analysis.exerciseType,
        exerciseDuration: analysis.exerciseDuration,
        exerciseIntensity: analysis.exerciseIntensity,
        stretchingMobility: analysis.stretchingMobility,
        restDayMentioned: analysis.restDayMentioned,
        nutritionMentioned: analysis.nutritionMentioned,
        nutritionSummary: analysis.nutritionSummary,
        foodLogged: JSON.stringify(analysis.foodLogged),
        waterIntake: analysis.waterIntake,
        alcoholMentioned: analysis.alcoholMentioned,
        caffeineNoted: analysis.caffeineNoted,
        physicalSymptoms: JSON.stringify(analysis.physicalSymptoms),
        painLevel: analysis.painLevel?.toString() ?? null,
        painLocation: JSON.stringify(analysis.painLocation),
        heartRateNoted: analysis.heartRateNoted,
        digestionNoted: analysis.digestionNoted,
        digestionNotes: analysis.digestionNotes,
        skinNoted: analysis.skinNoted,
        cycleNoted: analysis.cycleNoted,
        sunExposure: analysis.sunExposure,
        outdoorTime: analysis.outdoorTime,
        coldExposure: analysis.coldExposure,
        breathworkMeditation: analysis.breathworkMeditation,
        travelMentioned: analysis.travelMentioned,
        naturalEnvironment: analysis.naturalEnvironment,
        screenTimeNoted: analysis.screenTimeNoted,
        medicationsMentioned: JSON.stringify(analysis.medicationsMentioned),
        healthFlags: JSON.stringify(analysis.healthFlags),
        rawExtraction: JSON.stringify(analysis),
    })

    // Write to entry_analysis after the entry-level analysis finishes
    await db.delete(entryAnalysis).where(eq(entryAnalysis.entryId, entry.id))

    const [savedAnalysis] = await db
        .insert(entryAnalysis)
        .values({
            entryId: entry.id,
            userId: user.id,
            mood: analysis.mood,
            subject: analysis.subject,
            negative: analysis.negative,
            summary: analysis.summary,
            color: analysis.color,
            sentimentScore: analysis.sentimentScore.toString(),
        })
        .returning()

    update(['/journal'])

    return NextResponse.json({ data: { ...entry, analysis: savedAnalysis } })
}
