import HistoryChart from "@/components/history-chart";
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

    const total = analyses.reduce((acc, curr) => {
        return acc + parseFloat(curr.sentimentScore);
    }, 0);

    const average = total / analyses.length;
    return { analyses, average };
}

const HistoryPage = async () => {
    const { analyses, average } = await getData();

    return (
        <div className="h-full px-6 py-8">
            <div>
                <h1 className="text-2xl mb-4">{`Avg. Sentiment: ${average}`}</h1>
            </div>
            <div className="h-full w-full">
                <HistoryChart data={analyses} />
            </div>
        </div>
    )
}

export default HistoryPage;
