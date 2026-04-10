export type Analysis = {
    mood: string
    subject: string
    negative: boolean
    summary: string
    color: string
    sentimentScore: number
}

export type Entry = {
    id: string
    content: string
    analysis: Analysis
    createdAt: string
    updatedAt: string
    userId: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
    healthSnapshot?: string
}

export type HealthSnapshot = {
    energy: number      // 1–5
    stress: number      // 1–5
    sleepHours: number  // e.g. 7.5
    mood: string        // emoji character
}