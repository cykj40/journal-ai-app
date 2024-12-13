import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { loadQARefineChain } from 'langchain/chains';
import { NeonPostgres } from '@langchain/community/vectorstores/neon'
import { OpenAIEmbeddings } from '@langchain/openai'

import {
    StructuredOutputParser,
    OutputFixingParser,
} from 'langchain/output_parsers'
import { Document } from 'langchain/document'
import { z } from 'zod'

const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        mood: z
            .string()
            .describe('the mood of the person who wrote the journal entry.'),
        subject: z.string().describe('the subject of the journal entry.'),
        negative: z
            .boolean()
            .describe(
                'is the journal entry negative? (i.e. does it contain negative emotions?).'
            ),
        summary: z.string().describe('quick summary of the entire entry.'),
        color: z
            .string()
            .describe(
                'a hexidecimal color code that represents the mood of the entry. Example #0101fe for blue representing happiness.'
            ),
        sentimentScore: z
            .number()
            .describe(
                'sentiment of the text and rated on a scale from -10 to 10, where -10 is extremely negative, 0 is neutral, and 10 is extremely positive.'
            ),
    })
)

const getPrompt = async (content: string) => {
    const format_instructions = parser.getFormatInstructions()

    const prompt = new PromptTemplate({
        template:
            'Analyze the following journal entry. Follow the intrusctions and format your response to match the format instructions, no matter what! \n{format_instructions}\n{entry}',
        inputVariables: ['entry'],
        partialVariables: { format_instructions },
    })

    const input = await prompt.format({
        entry: content,
    })

    return input
}

export const analyzeEntry = async (entry: { id: string; userId: string; content: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null; createdAt: Date; updatedAt: Date; }) => {
    const input = await getPrompt(entry.content)
    const model = new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo',
        maxTokens: 1000
    })
    const output = await model.invoke(input)
    try {
        return parser.parse(output.content.toString())
    } catch (error) {
        const fixParser = OutputFixingParser.fromLLM(
            new ChatOpenAI({ temperature: 0, modelName: 'gpt-3.5-turbo' }),
            parser
        )
        const fix = await fixParser.parse(output.content.toString())
        return fix
    }
}

export const qa = async (question: string, entries: { id: string; content: string; createdAt: Date }[]) => {
    const docs = entries.map(
        (entry) =>
            new Document({
                pageContent: entry.content,
                metadata: { source: entry.id, date: entry.createdAt },
            })
    )
    const model = new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo',
        maxTokens: 1000
    })
    const chain = loadQARefineChain(model)
    const embeddings = new OpenAIEmbeddings({
        dimensions: 256,
        model: "text-embedding-3-small"
    })

    const vectorStore = await NeonPostgres.initialize(embeddings, {
        connectionString: process.env.DATABASE_URL!
    })

    await vectorStore.addDocuments(docs)
    const relevantDocs = await vectorStore.similaritySearch(question)
    const res = await chain.call({
        input_documents: relevantDocs,
        question,
    })

    return res.output_text
}