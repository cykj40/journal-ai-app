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

const CustomTooltip = ({ payload, label, active }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const dateLabel = new Date(label).toLocaleString('en-us', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    })

    const analysis = payload[0].payload
    return (
        <div className="p-8 custom-tooltip white/5 shadow-md border border-black/10 rounded-lg backdrop-blur-md relative">
            <div
                className="absolute left-2 top-2 w-2 h-2 rounded-full"
                style={{ background: analysis.color }}
            ></div>
            <p className="label text-sm text-black/30">{dateLabel}</p>
            <p className="intro text-xl uppercase">{analysis.mood}</p>
        </div>
    )
}

const HistoryChart = ({ data }: HistoryChartProps) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart width={300} height={100} data={data}>
                <Line
                    type="monotone"
                    dataKey="sentimentScore"
                    stroke="#8884d8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
                <XAxis dataKey="updatedAt" />
                <Tooltip content={<CustomTooltip />} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default HistoryChart