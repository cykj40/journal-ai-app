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
}