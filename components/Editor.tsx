'use client'
import { useRef } from 'react'
import Link from 'next/link'
import RichTextEditor, { type RichTextEditorHandle } from './RichTextEditor'
import DailyPrompt from './DailyPrompt'
import HealthSnapshot from './HealthSnapshot'
import { MicButton } from './MicButton'
import { useVoiceDictation } from '@/hooks/useVoiceDictation'

interface EditorProps {
    entry: {
        id: string
        createdAt?: string
    }
    content: string
    onChange: (content: string) => void
    isNew?: boolean
    isSaved: boolean
    onSave: () => void
    onDelete: () => void
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
    isSaved,
    onSave,
    onDelete,
}: EditorProps) => {
    const editorRef = useRef<RichTextEditorHandle>(null)
    const dateLabel = formatEntryDate(entry.createdAt)

    const { startRecording, stopRecording, isRecording, isTranscribing } = useVoiceDictation(
        (text) => editorRef.current?.insertContent(text)
    )

    return (
        <div className="flex flex-col w-full min-h-screen lg:h-full bg-gray-50 dark:bg-zinc-950">
            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-[680px] bg-white px-10 pt-10 pb-12 shadow-sm dark:bg-zinc-900 min-h-full">
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
                        placeholder="Write your entry..."
                    />

                    <div className="mt-4 flex items-center gap-3">
                        <Link href="/journal" className="text-sm text-[#3D4A3A] opacity-60 hover:opacity-100 transition-opacity">
                            ← Journal
                        </Link>
                        <div className="flex-1" />
                        <MicButton
                            isRecording={isRecording}
                            isTranscribing={isTranscribing}
                            onStart={startRecording}
                            onStop={stopRecording}
                        />
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 rounded-xl border border-red-300 text-sm text-red-500 hover:bg-red-50 transition-colors"
                        >
                            Delete
                        </button>
                        {isSaved && (
                            <span className="text-xs text-[#5C7A52] font-medium">✓ Saved</span>
                        )}
                        <button
                            onClick={onSave}
                            className="px-4 py-2 rounded-xl bg-[#5C7A52] text-white text-sm font-medium hover:bg-[#3D4A3A] transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Editor
