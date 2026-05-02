import OpenAI from 'openai'
import { neon } from '@neondatabase/serverless'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const sql = neon(process.env.DATABASE_URL!)

export const generateEmbedding = async (text: string): Promise<number[]> => {
    const res = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    })
    return res.data[0].embedding
}

export const findSimilarEntries = async (
    question: string,
    userId: string,
    limit: number = 10
): Promise<string[]> => {
    const embedding = await generateEmbedding(question)
    const vectorLiteral = `[${embedding.join(',')}]`

    const rows = await sql(
        `SELECT ve.content
         FROM vector_entries ve
         JOIN journal_entries je ON ve.entry_id = je.id
         WHERE je.user_id = $1
         ORDER BY ve.embedding <=> $2::vector
         LIMIT $3`,
        [userId, vectorLiteral, limit]
    )

    return (rows as { content: string }[]).map(r => r.content)
}
