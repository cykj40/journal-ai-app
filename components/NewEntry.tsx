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
        <div
            className="cursor-pointer overflow-hidden rounded-lg bg-white shadow hover:shadow-lg transition-shadow"
            onClick={handleOnClick}
        >
            <div className="px-4 py-5 sm:p-6">
                {isCreating ? (
                    <span className="text-3xl text-gray-400">Creating...</span>
                ) : (
                    <span className="text-3xl">New Entry</span>
                )}
            </div>
        </div>
    )
}

export default NewEntry