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
    const date = new Date(entry.createdAt).toDateString()

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation
        if (confirm('Are you sure you want to delete this entry?')) {
            setIsDeleting(true)
            await deleteEntry(entry.id)
            router.refresh()
        }
    }

    return (
        <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow relative group">
            {isDeleting && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <span>Deleting...</span>
                </div>
            )}
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <span>{date}</span>
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity"
                >
                    Delete
                </button>
            </div>
            <div className="px-4 py-5 sm:p-6">{entry.analysis.summary}</div>
            <div className="px-4 py-4 sm:px-6">{entry.analysis.mood}</div>
        </div>
    )
}

export default EntryCard