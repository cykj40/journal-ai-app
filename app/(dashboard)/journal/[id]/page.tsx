'use client'

import { type Entry, type Analysis } from '@/utils/types'
import Editor from '@/components/Editor'
import AISidebar from '@/components/AISidebar'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

const POLL_INTERVAL_MS = 4_000
const ANALYSIS_DEBOUNCE_MS = 8_000

const JournalEditorPage = () => {
    const params = useParams<{ id: string }>()
    const searchParams = useSearchParams()
    const entryId = params.id
    const isNew = searchParams.get('new') === 'true'

    const [entry, setEntry] = useState<Entry | null>(null)
    const [analysis, setAnalysis] = useState<Analysis | null>(null)
    const [loading, setLoading] = useState(true)

    // Ref to latest content for the debounced analysis trigger
    const latestContentRef = useRef<string>('')
    const analysisTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // ── Initial load ──────────────────────────────────────────────
    useEffect(() => {
        if (!entryId) return

        const loadEntry = async () => {
            try {
                const res = await fetch(`/api/journal/${entryId}`)
                if (!res.ok) throw new Error('Failed to load entry')
                const { data } = await res.json()
                setEntry(data)
                setAnalysis(data.analysis)
                latestContentRef.current = data.content
            } catch (error) {
                console.error('Error loading entry:', error)
            } finally {
                setLoading(false)
            }
        }

        loadEntry()
    }, [entryId])

    // ── Analysis polling — refresh sidebar every 4 s ──────────────
    useEffect(() => {
        if (!entryId) return

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/journal/${entryId}`)
                if (!res.ok) return
                const { data } = await res.json()
                // Only update analysis state (avoid clobbering editor content)
                setAnalysis(data.analysis)
                // Also update healthSnapshot on the entry
                setEntry(prev => prev ? { ...prev, healthSnapshot: data.healthSnapshot } : prev)
            } catch {
                // silent — polling is best-effort
            }
        }, POLL_INTERVAL_MS)

        return () => clearInterval(interval)
    }, [entryId])

    // ── Cleanup debounce timer on unmount ─────────────────────────
    useEffect(() => {
        return () => {
            if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current)
        }
    }, [])

    // ── Save content + schedule analysis trigger ──────────────────
    const saveEntry = useCallback(async (content: string) => {
        latestContentRef.current = content

        // Save content
        const res = await fetch(`/api/journal/${entryId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        })
        if (!res.ok) throw new Error('Failed to save entry')

        // Debounce AI analysis trigger (8 s after last save)
        if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current)
        analysisTimerRef.current = setTimeout(async () => {
            try {
                await fetch(`/api/entry/${entryId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ updates: { content: latestContentRef.current } }),
                })
            } catch {
                // silent — analysis is best-effort
            }
        }, ANALYSIS_DEBOUNCE_MS)
    }, [entryId])

    // ── Loading / not-found states ────────────────────────────────
    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500" />
            </div>
        )
    }

    if (!entry) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-400 text-sm">Entry not found</div>
            </div>
        )
    }

    return (
        <div className="flex h-full overflow-hidden">
            {/* Writing canvas */}
            <div className="flex-1 min-w-0 overflow-hidden">
                <Editor entry={entry} onSave={saveEntry} isNew={isNew} />
            </div>

            {/* AI Sidebar — hidden below lg */}
            <aside className="hidden lg:flex w-[300px] shrink-0 flex-col border-l border-gray-100 overflow-y-auto bg-white">
                <AISidebar
                    entryId={entryId}
                    analysis={analysis ?? entry.analysis}
                    healthSnapshot={entry.healthSnapshot}
                />
            </aside>
        </div>
    )
}

export default JournalEditorPage
