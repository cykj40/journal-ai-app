import HistoryChart from "@/components/HistoryChart";
import { getCurrentAppUser } from "@/utils/auth";
import { db } from "@/utils/db";
import { entryAnalysis } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";

const getData = async () => {
    const user = await getCurrentAppUser();

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
        color: analysis.color || '#5C7A52',
        sentimentScore: parseFloat(analysis.sentimentScore),
        updatedAt: analysis.updatedAt.toISOString()
    }));

    const total = formattedAnalyses.reduce((acc, curr) => acc + curr.sentimentScore, 0);
    const average = total / analyses.length;
    return { analyses: formattedAnalyses, average };
}

const HistoryPage = async () => {
    const { analyses, average } = await getData();

    if (analyses.length === 0) {
        return (
            <div className="px-6 pt-6 lg:max-w-4xl lg:mx-auto flex flex-col items-center justify-center min-h-[50vh] gap-3">
                <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center">
                    <svg className="w-5 h-5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1
                    className="text-xl font-semibold text-forest"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    No journal entries yet
                </h1>
                <p
                    className="text-forest-muted text-sm text-center"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                    Start writing to see your mood history.
                </p>
            </div>
        );
    }

    return (
        <div className="px-6 pt-6 pb-4 lg:max-w-4xl lg:mx-auto">
            <div className="mb-6">
                <h1
                    className="text-2xl font-semibold text-forest"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    History
                </h1>
                <p
                    className="text-forest-muted text-sm mt-1"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                    Avg. sentiment:{' '}
                    <span className="font-medium text-forest">{average.toFixed(2)}</span>
                </p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-sage-light/30" style={{ height: '320px' }}>
                <HistoryChart data={analyses} />
            </div>
        </div>
    );
};

export default HistoryPage;
