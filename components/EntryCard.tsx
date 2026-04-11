'use client'

import { type Entry } from '@/utils/types'
import { deleteEntry } from '@/utils/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface EntryCardProps {
    entry: Entry
}

const EntryCard = ({ entry }: EntryCardProps) => {
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)

    const shortDate = new Date(entry.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    })

    const rawScore = entry.analysis?.sentimentScore != null
        ? Number(entry.analysis.sentimentScore)
        : null
    const score = rawScore !== null && !isNaN(rawScore) ? rawScore.toFixed(1) : null

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (confirm('Are you sure you want to delete this entry?')) {
            setIsDeleting(true)
            await deleteEntry(entry.id)
            router.refresh()
        }
    }

    return (
        <div
            className="relative bg-white rounded-2xl px-4 py-4 shadow-sm border border-sage-light/30 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group"
            style={{ minHeight: '72px' }}
        >
            {isDeleting && (
                <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                    <span
                        className="text-xs text-forest-muted"
                        style={{ fontFamily: 'var(--font-dm-sans)' }}
                    >
                        Deleting…
                    </span>
                </div>
            )}

            <div className="flex items-start gap-3">
                {/* Mood color dot */}
                <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 mt-[5px]"
                    style={{ backgroundColor: entry.analysis.color || '#5C7A52' }}
                />

                <div className="flex-1 min-w-0">
                    {/* Top row: mood label + date */}
                    <div className="flex items-center justify-between mb-1 gap-2">
                        <span
                            className="text-xs font-medium text-forest-muted truncate"
                            style={{ fontFamily: 'var(--font-dm-sans)' }}
                        >
                            {entry.analysis.mood || 'No mood'}
                            {score ? ` · ${score}` : ''}
                        </span>
                        <span
                            className="text-xs text-forest-muted/60 tabular-nums shrink-0"
                            style={{ fontFamily: 'var(--font-dm-sans)' }}
                        >
                            {shortDate}
                        </span>
                    </div>

                    {/* Summary */}
                    <p
                        className="text-sm text-forest leading-relaxed"
                        style={{
                            fontFamily: 'var(--font-dm-sans)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {entry.analysis.summary || 'No summary yet'}
                    </p>
                </div>

                {/* Delete button — visible on hover/focus */}
                <button
                    onClick={handleDelete}
                    className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 text-red-400 hover:text-red-600 transition-opacity flex items-center justify-center"
                    style={{ minHeight: '44px', minWidth: '36px' }}
                    title="Delete entry"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default EntryCard
