'use client'
import { type Analysis } from '@/utils/types'
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts'
import { TooltipProps } from 'recharts/types/component/Tooltip'

interface CustomTooltipProps extends TooltipProps<number, string> {
    payload?: Array<{
        payload: Analysis & {
            updatedAt: string;
        };
    }>;
}

interface HistoryChartProps {
    data: Array<Analysis & { updatedAt: string }>;
}

const CustomTooltip = ({ payload, active }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const analysis = payload[0].payload
    const fullDate = new Date(analysis.updatedAt).toLocaleString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })

    return (
        <div className="p-8 custom-tooltip white/5 shadow-md border border-black/10 rounded-lg backdrop-blur-md relative">
            <div
                className="absolute left-2 top-2 w-2 h-2 rounded-full"
                style={{ background: analysis.color }}
            ></div>
            <p className="label text-sm text-black/30">{fullDate}</p>
            <p className="intro text-xl uppercase">{analysis.mood}</p>
        </div>
    )
}

const HistoryChart = ({ data }: HistoryChartProps) => {
    const chartData = data.map(item => ({
        ...item,
        dateLabel: new Date(item.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        }),
    }))

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart width={300} height={100} data={chartData}>
                <Line
                    type="monotone"
                    dataKey="sentimentScore"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
                <XAxis dataKey="dateLabel" />
                <Tooltip content={<CustomTooltip />} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default HistoryChart