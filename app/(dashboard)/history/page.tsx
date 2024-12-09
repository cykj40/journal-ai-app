import HistoryChart from "@/components/HistoryChart";
import { getUserFromClerkID } from "@/utils/auth";
import { db } from "@/utils/db";
import { entryAnalysis } from "@/utils/schema";
import { eq, asc } from "drizzle-orm";

const getData = async () => {
    const user = await getUserFromClerkID();

    const analyses = await db.query.entryAnalysis.findMany({
        where: eq(entryAnalysis.userId, user.id),
        orderBy: [asc(entryAnalysis.createdAt)],
    });

    if (analyses.length === 0) {
        return { analyses: [], average: 0 };
    }

    const total = analyses.reduce((acc, curr) => {
        return acc + parseFloat(curr.sentimentScore);
    }, 0);

    const average = total / analyses.length;
    return { analyses, average };
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
    )
}

export default HistoryPage;
