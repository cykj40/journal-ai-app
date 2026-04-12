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
    return (
        <div className="px-6 pt-6 pb-4 lg:max-w-4xl lg:mx-auto">
            <div className="mb-6">
                <h1
                    className="text-2xl font-semibold text-forest"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    Analytics
                </h1>
                <p
                    className="text-forest-muted text-sm mt-1"
                    style={{ fontFamily: 'var(--font-dm-sans)' }}
                >
                    Insights and patterns from your journaling
                </p>
            </div>
            <AnalyticsDashboard
                data={initialData}
                startDate={initialStartDate}
                endDate={initialEndDate}
            />
        </div>
    )
}
