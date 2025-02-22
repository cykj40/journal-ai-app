'use client'

import { useState } from 'react'
import { TimeComparison } from '@/components/DateRangeFilter'
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
    const [data, setData] = useState(initialData)
    const [isLoading, setIsLoading] = useState(false)

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
            {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <AnalyticsDashboard
                    data={data}
                    startDate={initialStartDate}
                    endDate={initialEndDate}
                />
            )}
        </div>
    )
} 