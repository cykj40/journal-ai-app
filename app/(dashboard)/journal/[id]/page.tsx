'use client'

import { type Entry } from '@/utils/types'
import Editor from '@/components/Editor'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const JournalEditorPage = () => {
    const params = useParams<{ id: string }>()
    const entryId = params.id
    const [entry, setEntry] = useState<Entry | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!entryId) {
            return
        }

        const loadEntry = async () => {
            try {
                const response = await fetch(`/api/journal/${entryId}`)
                if (!response.ok) {
                    throw new Error('Failed to load entry')
                }
                const data = await response.json()
                setEntry(data.data)
            } catch (error) {
                console.error('Error loading entry:', error)
            } finally {
                setLoading(false)
            }
        }

        loadEntry()
    }, [entryId])

    const saveEntry = useCallback(async (content: string) => {
        try {
            const response = await fetch(`/api/journal/${entryId}`, {
                method: 'PATCH',
                body: JSON.stringify({ content }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to save entry')
            }
        } catch (error) {
            console.error('Error saving entry:', error)
            throw error
        }
    }, [entryId])

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!entry) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500">Entry not found</div>
            </div>
        )
    }

    return (
        <div className="w-full h-full">
            <Editor entry={entry} onSave={saveEntry} />
        </div>
    )
}

export default JournalEditorPage

