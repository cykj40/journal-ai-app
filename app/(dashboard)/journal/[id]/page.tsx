'use client'

import { type Entry } from '@/utils/types'
import Editor from '@/components/Editor'
import { useCallback, useEffect, useState } from 'react'

interface Props {
    params: { id: string }
}

const JournalEditorPage = ({ params }: Props) => {
    const [entry, setEntry] = useState<Entry | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadEntry = async () => {
            try {
                const response = await fetch(`/api/journal/${params.id}`)
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
    }, [params.id])

    const saveEntry = useCallback(async (content: string) => {
        try {
            const response = await fetch(`/api/journal/${params.id}`, {
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
    }, [params.id])

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


