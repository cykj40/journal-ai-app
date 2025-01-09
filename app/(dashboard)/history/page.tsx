import HistoryChart from "@/components/HistoryChart";
import { getUserFromClerkID } from "@/utils/auth";
import { db } from "@/utils/db";
import { entryAnalysis } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";

const getData = async () => {
    const user = await getUserFromClerkID();

    const analyses = await db
        .select({
            id: entryAnalysis.id,
            mood: entryAnalysis.mood,
            subject: entryAnalysis.subject,
            negative: entryAnalysis.negative,
            summary: entryAnalysis.summary,
            color: entryAnalysis.color,
            sentimentScore: entryAnalysis.sentimentScore,
            updatedAt: entryAnalysis.updatedAt,
            createdAt: entryAnalysis.createdAt
        })
        .from(entryAnalysis)
        .where(eq(entryAnalysis.userId, user.id))
        .orderBy(desc(entryAnalysis.createdAt));

    if (analyses.length === 0) {
        return { analyses: [], average: 0 };
    }

    const formattedAnalyses = analyses.map(analysis => ({
        mood: analysis.mood,
        subject: analysis.subject,
        negative: analysis.negative,
        summary: analysis.summary,
        color: analysis.color || '#0101fe',
        sentimentScore: parseFloat(analysis.sentimentScore),
        updatedAt: analysis.updatedAt.toISOString()
    }));

    const total = formattedAnalyses.reduce((acc, curr) => {
        return acc + curr.sentimentScore;
    }, 0);

    const average = total / analyses.length;
    return { analyses: formattedAnalyses, average };
}

const HistoryPage = async () => {
    const { analyses, average } = await getData();

    if (analyses.length === 0) {
        return (
            <div className="h-full px-6 py-8 flex flex-col items-center justify-center">
                <h1 className="text-2xl mb-4">No Journal Entries Yet</h1>
                <p className="text-gray-500">Start writing to see your mood history!</p>
            </div>
        );
    }

    return (
        <div className="h-full px-6 py-8">
            <div>
                <h1 className="text-2xl mb-4">
                    {`Avg. Sentiment: ${average.toFixed(2)}`}
                </h1>
            </div>
            <div className="h-[calc(100%-100px)] w-full">
                <HistoryChart data={analyses} />
            </div>
        </div>
    );
};

export default HistoryPage;
