'use client'

import { useState } from 'react'
import { HEALTH_PROMPTS } from '@/utils/prompts'

interface DailyPromptProps {
    onInsert: (text: string) => void
}

function getDayOfYear(): number {
    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const DailyPrompt = ({ onInsert }: DailyPromptProps) => {
    const [dismissed, setDismissed] = useState(false)
    const [used, setUsed] = useState(false)

    if (dismissed) return null

    const prompt = HEALTH_PROMPTS[getDayOfYear() % HEALTH_PROMPTS.length]

    const handleUse = () => {
        onInsert(`<p><em>${prompt}</em></p><p></p>`)
        setUsed(true)
    }

    return (
        <div className="mb-8 rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-950/20 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-violet-500 mb-1.5 tracking-wide uppercase">
                        {"Today's prompt"}
                    </p>
                    <p className="text-sm italic text-gray-600 dark:text-zinc-300 leading-relaxed">
                        {prompt}
                    </p>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="shrink-0 text-gray-300 dark:text-zinc-600 hover:text-gray-500 dark:hover:text-zinc-400 transition-colors mt-0.5"
                    title="Dismiss"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {!used ? (
                <button
                    onClick={handleUse}
                    className="mt-3 text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
                >
                    Use this prompt →
                </button>
            ) : (
                <p className="mt-3 text-xs text-gray-400 dark:text-zinc-500">Prompt inserted. Start writing below.</p>
            )}
        </div>
    )
}

export default DailyPrompt
