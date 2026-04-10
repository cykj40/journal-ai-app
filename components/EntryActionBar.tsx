'use client'

import MicButton from './MicButton'

interface EntryActionBarProps {
    entryId: string | null
    isSaving: boolean
    isDirty: boolean
    onSave: () => void
    onDelete: () => void
    onNew: () => void
    onDiscard: () => void
    // Voice dictation
    isRecording?: boolean
    isTranscribing?: boolean
    onMicStart?: () => void
    onMicStop?: () => void
    micError?: string | null
}

const baseButtonClassName =
    'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

const EntryActionBar = ({
    entryId,
    isSaving,
    isDirty,
    onSave,
    onDelete,
    onNew,
    onDiscard,
    isRecording = false,
    isTranscribing = false,
    onMicStart,
    onMicStop,
    micError,
}: EntryActionBarProps) => {
    return (
        <div className="sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
            {micError && (
                <div className="mx-auto w-full max-w-[680px] px-10 pt-2">
                    <p className="text-xs text-red-500 dark:text-red-400">{micError}</p>
                </div>
            )}
            <div className="mx-auto flex w-full max-w-[680px] items-center justify-between gap-3 px-10 py-4">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onNew}
                        className={`${baseButtonClassName} border border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800`}
                    >
                        New Entry
                    </button>

                    {onMicStart && onMicStop && (
                        <MicButton
                            isRecording={isRecording}
                            isTranscribing={isTranscribing}
                            onStart={onMicStart}
                            onStop={onMicStop}
                        />
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {isDirty && (
                        <button
                            type="button"
                            onClick={onDiscard}
                            className={`${baseButtonClassName} text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800`}
                        >
                            Discard Changes
                        </button>
                    )}

                    {entryId && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className={`${baseButtonClassName} border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/70 dark:text-red-400 dark:hover:bg-red-950/40`}
                        >
                            Delete
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onSave}
                        disabled={isSaving || !isDirty}
                        className={`${baseButtonClassName} min-w-[96px] bg-violet-600 text-white hover:bg-violet-700`}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="h-4 w-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 0 1 8-8v8H4Z"
                                    />
                                </svg>
                                Saving
                            </span>
                        ) : (
                            'Save'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export type { EntryActionBarProps }
export default EntryActionBar
