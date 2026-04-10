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

    const score = entry.analysis.sentimentScore
        ? entry.analysis.sentimentScore.toFixed(1)
        : null

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault()
        if (confirm('Are you sure you want to delete this entry?')) {
            setIsDeleting(true)
            await deleteEntry(entry.id)
            router.refresh()
        }
    }

    return (
        <div className="relative flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/60 group transition-colors cursor-pointer">
            {isDeleting && (
                <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400 dark:text-zinc-500">Deleting...</span>
                </div>
            )}

            {/* Date */}
            <span className="w-[52px] shrink-0 text-xs text-gray-400 dark:text-zinc-500 font-sans tabular-nums">
                {shortDate}
            </span>

            {/* Color dot */}
            <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.analysis.color || '#6366f1' }}
            />

            {/* Summary */}
            <p className="flex-1 text-sm text-gray-600 dark:text-zinc-400 truncate min-w-0">
                {entry.analysis.summary || 'No summary yet'}
            </p>

            {/* Mood + score badge */}
            {entry.analysis.mood && (
                <span className="shrink-0 text-xs text-gray-400 dark:text-zinc-500 font-sans whitespace-nowrap">
                    {entry.analysis.mood}{score ? ` · ${score}` : ''}
                </span>
            )}

            {/* Delete */}
            <button
                onClick={handleDelete}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-xs text-red-400 hover:text-red-600 transition-opacity"
                title="Delete entry"
            >
                ✕
            </button>
        </div>
    )
}

export default EntryCard
