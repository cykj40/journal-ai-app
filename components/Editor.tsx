'use client'
import { useRef } from 'react'
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor'
import DailyPrompt from './DailyPrompt'
import HealthSnapshot from './HealthSnapshot'
import EntryActionBar from './EntryActionBar'

interface EditorProps {
    entry: {
        id: string
        createdAt?: string
    }
    content: string
    onChange: (content: string) => void
    isNew?: boolean
    isSaving: boolean
    isDirty: boolean
    onSave: () => void
    onDelete: () => void
    onNew: () => void
    onDiscard: () => void
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

const Editor = ({
    entry,
    content,
    onChange,
    isNew = false,
    isSaving,
    isDirty,
    onSave,
    onDelete,
    onNew,
    onDiscard,
}: EditorProps) => {
    const editorRef = useRef<RichTextEditorHandle>(null)

    const dateLabel = formatEntryDate(entry.createdAt)

    return (
        <div className="relative w-full h-full overflow-y-auto bg-gray-50 dark:bg-zinc-950">
            <div className="mx-auto w-full max-w-[680px] min-h-full bg-white px-10 py-16 pb-32 shadow-sm dark:bg-zinc-900">
                {dateLabel && (
                    <p className="mb-8 text-sm tracking-wide text-gray-400 dark:text-zinc-500 font-sans select-none">
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
                    content={content}
                    onChange={onChange}
                    placeholder="Write your thoughts here..."
                />
            </div>

            <EntryActionBar
                entryId={entry.id}
                isSaving={isSaving}
                isDirty={isDirty}
                onSave={onSave}
                onDelete={onDelete}
                onNew={onNew}
                onDiscard={onDiscard}
            />

            <div className="absolute bottom-24 right-6 text-xs text-gray-400 dark:text-zinc-600 select-none pointer-events-none transition-opacity duration-300">
                {isSaving ? 'Saving...' : 'Saved'}
            </div>
        </div>
    )
}

export default Editor
