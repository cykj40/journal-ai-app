'use client'

import { type Entry, type Analysis } from '@/utils/types'
import Editor from '@/components/Editor'
import AISidebar from '@/components/AISidebar'
import DeleteEntryDialog from '@/components/DeleteEntryDialog'
import { deleteEntry } from '@/utils/api'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'

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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const latestContentRef = useRef<string>('')
    const savedContentRef = useRef<string>('')
    const savingInFlightRef = useRef(false)

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

    // ── Save content ──────────────────────────────────────────────
    const saveEntry = useCallback(async (content: string) => {
        if (!entryId || savingInFlightRef.current || content === savedContentRef.current) return

        latestContentRef.current = content
        savingInFlightRef.current = true

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
        } finally {
            savingInFlightRef.current = false
        }
    }, [entryId])

    const handleEditorChange = useCallback((content: string) => {
        latestContentRef.current = content
        setEditorContent(content)
        setIsDirty(content !== savedContentRef.current)
    }, [])

    const handleSave = useCallback(async () => {
        try {
            await saveEntry(editorContent)
            // Trigger health analysis after explicit save — fire and forget
            fetch(`/api/entry/${entryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates: { content: editorContent } }),
            }).catch(() => {
                // silent — analysis is best-effort
            })
        } catch (error) {
            console.error('Failed to save entry:', error)
        }
    }, [editorContent, entryId, saveEntry])

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
                if (!savingInFlightRef.current && isDirty) {
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
    }, [handleDiscard, handleSave, isDirty])

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
                        onSave={() => {
                            void handleSave()
                        }}
                        onDelete={handleDelete}
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
