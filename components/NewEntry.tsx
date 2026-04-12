'use client'

import { newEntry } from '@/utils/api'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const NewEntry = () => {
    const router = useRouter()
    const [isCreating, setIsCreating] = useState(false)

    const handleOnClick = async () => {
        try {
            setIsCreating(true)
            const { data } = await newEntry()
            router.push(`/journal/${data.id}?new=true`)
        } catch (error) {
            console.error('Failed to create entry:', error)
        } finally {
            setIsCreating(false)
        }
    }

    return (
        /*
         * Positioning via CSS custom properties defined in globals.css.
         * Mobile:  sits above the bottom tab bar + safe area
         * Desktop: standard bottom-right corner (no tab bar to avoid)
         */
        <button
            onClick={handleOnClick}
            disabled={isCreating}
            title="New entry"
            className="fab-btn fixed z-50 w-14 h-14 rounded-full bg-forest hover:bg-forest/90 active:scale-95 text-white shadow-xl border border-white/20 hover:shadow-2xl transition-all flex items-center justify-center disabled:opacity-60"
        >
            {isCreating ? (
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            )}
        </button>
    )
}

export default NewEntry
