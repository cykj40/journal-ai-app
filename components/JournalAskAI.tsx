'use client'

import { useState } from 'react'

const JournalAskAI = () => {
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [loading, setLoading] = useState(false)

    const handleAsk = async () => {
        if (!question.trim() || loading) return
        setLoading(true)
        setAnswer('')
        try {
            const res = await fetch('/api/question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question }),
            })
            if (!res.ok) throw new Error('Request failed')
            const { data } = await res.json()
            setAnswer(data ?? '')
        } catch {
            setAnswer('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setQuestion('')
        setAnswer('')
    }

    return (
        <div
            className="mb-8 bg-white rounded-2xl border border-sage-light/30 shadow-sm px-4 py-4"
            style={{ fontFamily: 'var(--font-dm-sans)' }}
        >
            <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        void handleAsk()
                    }
                }}
                placeholder="Ask anything about your journal..."
                rows={2}
                className="w-full resize-none bg-transparent text-sm text-forest placeholder:text-forest-muted outline-none"
            />

            <div className="flex items-center justify-end gap-2 mt-3">
                {(question || answer) && (
                    <button
                        onClick={handleClear}
                        className="px-3 py-1.5 rounded-xl border border-sage-light text-xs text-forest-muted hover:text-forest transition-colors"
                    >
                        Clear
                    </button>
                )}
                <button
                    onClick={() => void handleAsk()}
                    disabled={!question.trim() || loading}
                    className="px-4 py-1.5 rounded-xl bg-[#5C7A52] text-white text-xs font-medium hover:bg-[#3D4A3A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? 'Asking…' : 'Ask'}
                </button>
            </div>

            {answer && (
                <div className="mt-4 pt-4 border-t border-sage-light/40 text-sm text-forest leading-relaxed whitespace-pre-wrap">
                    {answer}
                </div>
            )}
        </div>
    )
}

export default JournalAskAI
