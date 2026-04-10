'use client'

import AnalyticsDashboard from '@/components/AnalyticsDashboard'

interface ClientAnalyticsProps {
    initialData: any
    startDate: Date
    endDate: Date
}

export default function ClientAnalytics({
    initialData,
    startDate: initialStartDate,
    endDate: initialEndDate,
}: ClientAnalyticsProps) {
    const data = initialData

    return (
        <div className="h-full p-8">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Journal Analytics</h1>
                </div>
                <p className="text-gray-500">
                    Insights and patterns from your journaling practice
                </p>
            </div>
            <AnalyticsDashboard
                data={data}
                startDate={initialStartDate}
                endDate={initialEndDate}
            />
        </div>
    )
} 