'use client'
import { useRef, useState } from 'react'
import { useAutosave } from 'react-autosave'
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor'
import DailyPrompt from './DailyPrompt'
import HealthSnapshot from './HealthSnapshot'

interface EditorProps {
    entry: {
        id: string
        content: string
        createdAt?: string
    }
    onSave: (content: string) => Promise<void>
    isNew?: boolean
}

function formatEntryDate(dateStr?: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })
}

const Editor = ({ entry, onSave, isNew = false }: EditorProps) => {
    const [value, setValue] = useState(entry.content)
    const [isSaving, setIsSaving] = useState(false)
    const editorRef = useRef<RichTextEditorHandle>(null)

    useAutosave({
        data: value,
        onSave: async (content) => {
            try {
                setIsSaving(true)
                await onSave(content)
            } catch (error) {
                console.error('Failed to save:', error)
            } finally {
                setIsSaving(false)
            }
        },
        interval: 2000,
    })

    const dateLabel = formatEntryDate(entry.createdAt)

    return (
        <div className="relative w-full h-full overflow-y-auto bg-gray-50">
            <div className="mx-auto w-full max-w-[680px] min-h-full bg-white px-10 py-16 shadow-sm">
                {dateLabel && (
                    <p className="mb-8 text-sm tracking-wide text-gray-400 font-sans select-none">
                        {dateLabel}
                    </p>
                )}

                {isNew && (
                    <>
                        <HealthSnapshot entryId={entry.id} />
                        <DailyPrompt
                            onInsert={(text) => editorRef.current?.insertContent(text)}
                        />
                    </>
                )}

                <RichTextEditor
                    ref={editorRef}
                    content={value}
                    onChange={setValue}
                    placeholder="Write your thoughts here..."
                />
            </div>

            <div className="fixed bottom-5 right-6 text-xs text-gray-400 select-none pointer-events-none transition-opacity duration-300">
                {isSaving ? 'Saving...' : 'Saved'}
            </div>
        </div>
    )
}

export default Editor
