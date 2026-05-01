import Anthropic from '@anthropic-ai/sdk'
import { anthropic as anthropicProvider } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { z } from 'zod'

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type EntryAnalysis = {
    // Core mood
    mood: string
    subject: string
    negative: boolean
    summary: string
    color: string
    sentimentScore: number

    // Mental / cognitive
    moodStability: 'stable' | 'variable' | 'crashed'
    anxietyLevel: number | null        // 1–5
    motivationLevel: number | null     // 1–5
    gratitudeMentioned: boolean
    socialConnection: 'isolated' | 'neutral' | 'connected' | null

    // Energy & stress
    energyLevel: number | null         // 1–5
    stressLevel: number | null         // 1–5
    workStress: boolean
    workStressSeverity: number | null  // 1–5

    // Sleep
    sleepQuality: number | null        // 1–5

    // Exercise & movement
    exerciseMentioned: boolean
    exerciseType: string | null
    exerciseDuration: string | null
    exerciseIntensity: 'low' | 'medium' | 'high' | null
    stretchingMobility: boolean
    restDayMentioned: boolean

    // Nutrition & substances
    nutritionMentioned: boolean
    nutritionSummary: string | null
    foodLogged: string[]
    waterIntake: string | null
    alcoholMentioned: boolean
    caffeineNoted: boolean

    // Physical body
    physicalSymptoms: string[]
    painLevel: number | null           // 0–10
    painLocation: string[]
    heartRateNoted: boolean
    digestionNoted: boolean
    digestionNotes: string | null
    skinNoted: boolean
    cycleNoted: boolean

    // Environment & recovery
    sunExposure: boolean
    outdoorTime: boolean
    coldExposure: boolean
    breathworkMeditation: boolean
    travelMentioned: boolean
    naturalEnvironment: boolean
    screenTimeNoted: boolean

    // Medications & supplements
    medicationsMentioned: string[]

    // Summary flags
    healthFlags: string[]
}

// ── analyzeEntry ──────────────────────────────────────────────────────────────

export const analyzeEntry = async (entry: {
    id: string
    content: string
}): Promise<EntryAnalysis> => {
    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2000,
        messages: [
            {
                role: 'user',
                content: `You are a health and wellness journal analyst. Analyze the following journal entry and extract both emotional and physical health signals.

Respond ONLY with a valid JSON object. No markdown, no explanation, no code blocks. Just raw JSON.

Required fields and their types:
{
  "mood": "string — primary mood label e.g. Happy, Anxious, Tired, Motivated",
  "subject": "string — main topic/theme of the entry",
  "negative": "boolean — true if entry contains predominantly negative emotions",
  "summary": "string — 1-2 sentence summary of the entry",
  "color": "string — hex color representing the mood e.g. #5C7A52 for calm, #E57373 for stress",
  "sentimentScore": "number — -10 to 10 scale",
  "moodStability": "stable | variable | crashed",
  "anxietyLevel": "number 1-5 or null if not inferable",
  "motivationLevel": "number 1-5 or null if not inferable",
  "gratitudeMentioned": "boolean",
  "socialConnection": "isolated | neutral | connected | null",
  "energyLevel": "number 1-5 or null",
  "stressLevel": "number 1-5 or null",
  "workStress": "boolean",
  "workStressSeverity": "number 1-5 or null",
  "sleepQuality": "number 1-5 or null",
  "exerciseMentioned": "boolean",
  "exerciseType": "string or null — e.g. running, yoga, cycling, walking",
  "exerciseDuration": "string or null — e.g. 30 minutes",
  "exerciseIntensity": "low | medium | high | null",
  "stretchingMobility": "boolean",
  "restDayMentioned": "boolean",
  "nutritionMentioned": "boolean",
  "nutritionSummary": "string or null",
  "foodLogged": "array of strings",
  "waterIntake": "string or null",
  "alcoholMentioned": "boolean",
  "caffeineNoted": "boolean",
  "physicalSymptoms": "array of strings e.g. headache, fatigue, bloating",
  "painLevel": "number 0-10 or null",
  "painLocation": "array of strings e.g. lower back, knees",
  "heartRateNoted": "boolean",
  "digestionNoted": "boolean",
  "digestionNotes": "string or null",
  "skinNoted": "boolean",
  "cycleNoted": "boolean",
  "sunExposure": "boolean",
  "outdoorTime": "boolean",
  "coldExposure": "boolean",
  "breathworkMeditation": "boolean",
  "travelMentioned": "boolean",
  "naturalEnvironment": "boolean",
  "screenTimeNoted": "boolean",
  "medicationsMentioned": "array of strings",
  "healthFlags": "array of strings — notable health signals worth flagging e.g. reports chronic fatigue, skipped meals, high stress day, sleep deprived"
}

Journal entry:
${entry.content}`,
            },
        ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''

    try {
        return JSON.parse(raw) as EntryAnalysis
    } catch {
        // Second attempt — ask Claude to fix its own output
        const fix = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 2000,
            messages: [
                {
                    role: 'user',
                    content: `The following is not valid JSON. Fix it and return only valid JSON, no markdown:\n\n${raw}`,
                },
            ],
        })
        const fixedRaw = fix.content[0].type === 'text' ? fix.content[0].text : '{}'
        return JSON.parse(fixedRaw) as EntryAnalysis
    }
}

// ── qa ────────────────────────────────────────────────────────────────────────

export const qa = async (
    question: string,
    entries: { id: string; content: string; createdAt: Date }[]
): Promise<string> => {
    const recent = entries.slice(-20)
    const context = recent
        .map(e => `[${e.createdAt.toISOString().slice(0, 10)}]\n${e.content}`)
        .join('\n\n---\n\n')

    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [
            {
                role: 'user',
                content: `You are a health and mood journal coach. Answer questions about mood, energy, stress, sleep, and physical symptoms based on the journal entries provided. Keep answers concise — 2-3 sentences max unless more detail is clearly needed.

Journal entries:
${context}

User question: ${question}`,
            },
        ],
    })

    return message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate response.'
}

// ── generateBalanceInsight ────────────────────────────────────────────────────

const BalanceInsightSchema = z.object({
    score: z.number().int().min(0).max(100),
    insight: z.string(),
    recommendation: z.string(),
})

export const generateBalanceInsight = async (
    metrics: Array<Record<string, unknown>>
): Promise<{ score: number; insight: string; recommendation: string }> => {
    const { object } = await generateObject({
        model: anthropicProvider('claude-sonnet-4-5'),
        schema: BalanceInsightSchema,
        system: `You are a health balance coach. Analyze the user's recent health metrics and return a score (0-100 representing overall life balance — higher means more balanced across exercise, nutrition, sleep, social connection, mental health, stress management), an insight (1-2 sentences describing the main pattern), and a recommendation (1 specific actionable suggestion to improve balance). Be direct and concrete, not generic.`,
        prompt: `Recent health metrics: ${JSON.stringify(metrics)}`,
    })

    return object
}
