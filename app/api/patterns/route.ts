import Anthropic from '@anthropic-ai/sdk'
import { getCurrentAppUser } from '@/utils/auth'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function summarizeMetrics(rows: Record<string, unknown>[]) {
    const count = rows.length
    if (count === 0) return { count: 0 }

    const avg = (key: string) => {
        const vals = rows.map(r => parseFloat(r[key] as string)).filter(v => !isNaN(v))
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
    }
    const boolRate = (key: string) => {
        const trues = rows.filter(r => r[key] === true).length
        return `${Math.round((trues / count) * 100)}%`
    }
    const flags = rows.flatMap(r => {
        try { return JSON.parse(r.healthFlags as string ?? '[]') } catch { return [] }
    })

    return {
        count,
        avgMoodStability: avg('moodStability'),
        avgEnergyLevel: avg('energyLevel'),
        avgStressLevel: avg('stressLevel'),
        avgSleepQuality: avg('sleepQuality'),
        exerciseRate: boolRate('exerciseMentioned'),
        gratitudeRate: boolRate('gratitudeMentioned'),
        workStressRate: boolRate('workStress'),
        alcoholRate: boolRate('alcoholMentioned'),
        healthFlags: [...new Set(flags)].slice(0, 20),
    }
}

function summarizeAnalysis(rows: Record<string, unknown>[]) {
    const count = rows.length
    if (count === 0) return { count: 0 }

    const moods = rows.map(r => r.mood).filter(Boolean)
    const moodFreq: Record<string, number> = {}
    for (const m of moods) moodFreq[m as string] = (moodFreq[m as string] ?? 0) + 1
    const topMoods = Object.entries(moodFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([m]) => m)

    const scores = rows.map(r => parseFloat(r.sentimentScore as string)).filter(v => !isNaN(v))
    const avgSentiment = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : null
    const negativeRate = `${Math.round((rows.filter(r => r.negative).length / count) * 100)}%`

    return { count, topMoods, avgSentiment, negativeRate }
}

export const POST = async (request: Request) => {
    await getCurrentAppUser()

    const { healthMetrics, entryAnalysis } = await request.json() as {
        healthMetrics: Record<string, unknown>[]
        entryAnalysis: Record<string, unknown>[]
    }

    const metricsSummary = summarizeMetrics(healthMetrics)
    const analysisSummary = summarizeAnalysis(entryAnalysis)

    const userPrompt = `Analyze this 90-day health journal summary and return a JSON object with exactly four keys.

Health metrics summary (${metricsSummary.count} entries):
${JSON.stringify(metricsSummary, null, 2)}

Journal analysis summary (${analysisSummary.count} entries):
${JSON.stringify(analysisSummary, null, 2)}

Return ONLY a valid JSON object with these four keys, each a string of 2-4 sentences:
- recurringThemes: patterns in sleep, stress, exercise, and nutrition
- habitPatterns: frequent positive and negative habits detected
- healthFlags: warning patterns that deserve attention
- moodEnergyCorrelations: how mood and energy tracked together over time`

    let text = ''
    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 1024,
            system: 'You are a health pattern analyst. Analyze journal data and return concise, actionable insights as valid JSON. No markdown, no code blocks — raw JSON only.',
            messages: [{ role: 'user', content: userPrompt }],
        })
        text = (message.content[0] as { type: string; text: string }).text.trim()
    } catch {
        return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
    }

    try {
        const data = JSON.parse(text) as {
            recurringThemes: string
            habitPatterns: string
            healthFlags: string
            moodEnergyCorrelations: string
        }
        return NextResponse.json({ data })
    } catch {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
}
