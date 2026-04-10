'use client'

interface MicButtonProps {
    isRecording: boolean
    isTranscribing: boolean
    onStart: () => void
    onStop: () => void
}

export function MicButton({ isRecording, isTranscribing, onStart, onStop }: MicButtonProps) {
    if (isTranscribing) {
        return (
            <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-400 dark:text-zinc-500 transition-colors"
            >
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Transcribing…
            </button>
        )
    }

    if (isRecording) {
        return (
            <button
                type="button"
                onClick={onStop}
                className="inline-flex animate-pulse items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
            >
                {/* Mic-off icon */}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23M12 19v4M8 23h8" />
                </svg>
                Stop
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
            {/* Mic icon */}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
            </svg>
            Dictate
        </button>
    )
}

export default MicButton
