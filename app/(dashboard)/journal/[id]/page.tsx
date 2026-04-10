'use client'

import { type Entry, type Analysis } from '@/utils/types'
import Editor from '@/components/Editor'
import AISidebar from '@/components/AISidebar'
import DeleteEntryDialog from '@/components/DeleteEntryDialog'
import { deleteEntry, newEntry } from '@/utils/api'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAutosave } from 'react-autosave'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

const POLL_INTERVAL_MS = 4_000
const ANALYSIS_DEBOUNCE_MS = 8_000

const JournalEditorPage = () => {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const searchParams = useSearchParams()
    const entryId = params.id
    const isNew = searchParams.get('new') === 'true'

    const [entry, setEntry] = useState<Entry | null>(null)
    const [analysis, setAnalysis] = useState<Analysis | null>(null)
    const [loading, setLoading] = useState(true)
    const [editorContent, setEditorContent] = useState('')
    const [isDirty, setIsDirty] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Ref to latest content for the debounced analysis trigger
    const latestContentRef = useRef<string>('')
    const savedContentRef = useRef<string>('')
    const isSavingRef = useRef(false)
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
                setEditorContent(data.content)
                latestContentRef.current = data.content
                savedContentRef.current = data.content
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
        if (!entryId || isSavingRef.current || content === savedContentRef.current) return

        latestContentRef.current = content
        isSavingRef.current = true
        setIsSaving(true)

        try {
            const res = await fetch(`/api/journal/${entryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })
            if (!res.ok) throw new Error('Failed to save entry')

            const { data } = await res.json()
            setEntry(prev => prev ? { ...prev, content: data.content, updatedAt: data.updatedAt } : prev)
            savedContentRef.current = content
            setIsDirty(latestContentRef.current !== content)

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
        } finally {
            isSavingRef.current = false
            setIsSaving(false)
        }
    }, [entryId])

    useAutosave({
        data: editorContent,
        onSave: async (content) => {
            try {
                await saveEntry(content)
            } catch (error) {
                console.error('Failed to autosave:', error)
            }
        },
        interval: 2000,
    })

    const handleEditorChange = useCallback((content: string) => {
        latestContentRef.current = content
        setEditorContent(content)
        setIsDirty(content !== savedContentRef.current)
    }, [])

    const handleSave = useCallback(async () => {
        try {
            await saveEntry(editorContent)
        } catch (error) {
            console.error('Failed to save entry:', error)
        }
    }, [editorContent, saveEntry])

    const handleDelete = useCallback(() => {
        setIsDeleteDialogOpen(true)
    }, [])

    const confirmDelete = useCallback(async () => {
        if (!entry?.id) return

        try {
            setIsDeleting(true)
            await deleteEntry(entry.id)
            router.push('/journal')
            router.refresh()
        } catch (error) {
            console.error('Failed to delete entry:', error)
        } finally {
            setIsDeleting(false)
            setIsDeleteDialogOpen(false)
        }
    }, [entry?.id, router])

    const handleNew = useCallback(async () => {
        try {
            const { data } = await newEntry()
            router.push(`/journal/${data.id}?new=true`)
        } catch (error) {
            console.error('Failed to create entry:', error)
        }
    }, [router])

    const handleDiscard = useCallback(() => {
        const nextContent = savedContentRef.current
        latestContentRef.current = nextContent
        setEditorContent(nextContent)
        setIsDirty(false)
    }, [])

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isSaveShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's'

            if (isSaveShortcut) {
                event.preventDefault()
                if (!isSaving && isDirty) {
                    void handleSave()
                }
            }

            if (event.key === 'Escape' && isDirty) {
                event.preventDefault()
                handleDiscard()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleDiscard, handleSave, isDirty, isSaving])

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
                <div className="text-gray-400 dark:text-zinc-500 text-sm">Entry not found</div>
            </div>
        )
    }

    return (
        <>
            <div className="flex h-full overflow-hidden">
                {/* Writing canvas */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <Editor
                        entry={entry}
                        content={editorContent}
                        onChange={handleEditorChange}
                        isNew={isNew}
                        isSaving={isSaving}
                        isDirty={isDirty}
                        onSave={() => {
                            void handleSave()
                        }}
                        onDelete={handleDelete}
                        onNew={() => {
                            void handleNew()
                        }}
                        onDiscard={handleDiscard}
                    />
                </div>

                {/* AI Sidebar — hidden below lg */}
                <aside className="hidden lg:flex w-[300px] shrink-0 flex-col border-l border-gray-100 dark:border-zinc-800 overflow-y-auto bg-white dark:bg-zinc-900">
                    <AISidebar
                        analysis={analysis ?? entry.analysis}
                        healthSnapshot={entry.healthSnapshot}
                    />
                </aside>
            </div>

            <DeleteEntryDialog
                isOpen={isDeleteDialogOpen}
                isDeleting={isDeleting}
                onCancel={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => {
                    void confirmDelete()
                }}
            />
        </>
    )
}

export default JournalEditorPage
