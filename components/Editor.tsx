'use client'
import { updateEntry, deleteEntry } from '@/utils/api'
import { useState } from 'react'
import { useAutosave } from 'react-autosave'
import Spinner from '@/components/Spinner'
import { useRouter, useSearchParams } from 'next/navigation'

type Analysis = {
    mood: string
    subject: string
    negative: boolean
    summary: string
    color: string
    sentimentScore: number
}

type Entry = {
    id: string
    content: string
    analysis: Analysis
    createdAt: string
    updatedAt: string
    userId: string
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

interface EditorProps {
    entry: Entry
}

const Editor = ({ entry }: EditorProps) => {
    const [text, setText] = useState(entry.content)
    const [currentEntry, setEntry] = useState(entry)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const isNewEntry = searchParams.get('new') === 'true'

    const handleDelete = async () => {
        await deleteEntry(entry.id)
        router.push('/journal')
    }

    const handleSave = async () => {
        setIsSaving(true)
        await updateEntry(entry.id, { content: text })
        router.push('/journal')
        router.refresh()
    }

    useAutosave({
        data: text,
        onSave: async (_text) => {
            if (isNewEntry || _text === entry.content) return
            setIsSaving(true)
            const { data } = await updateEntry(entry.id, { content: _text })
            setEntry(data)
            setIsSaving(false)
        },
    })

    return (
        <div className="w-full h-full grid grid-cols-3 gap-0 relative">
            <div className="absolute left-0 top-0 p-2">
                {isSaving ? (
                    <Spinner />
                ) : (
                    <div className="w-[16px] h-[16px] rounded-full bg-green-500"></div>
                )}
            </div>
            <div className="col-span-2">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-full text-xl p-8"
                />
            </div>
            <div className="border-l border-black/5">
                <div
                    style={{ background: currentEntry.analysis.color }}
                    className="h-[100px] bg-blue-600 text-white p-8"
                >
                    <h2 className="text-2xl bg-white/25 text-black">Analysis</h2>
                </div>
                <div>
                    <ul role="list" className="divide-y divide-gray-200">
                        <li className="py-4 px-8 flex items-center justify-between">
                            <div className="text-xl font-semibold w-1/3">Subject</div>
                            <div className="text-xl">{currentEntry.analysis.subject}</div>
                        </li>

                        <li className="py-4 px-8 flex items-center justify-between">
                            <div className="text-xl font-semibold">Mood</div>
                            <div className="text-xl">{currentEntry.analysis.mood}</div>
                        </li>

                        <li className="py-4 px-8 flex items-center justify-between">
                            <div className="text-xl font-semibold">Negative</div>
                            <div className="text-xl">
                                {currentEntry.analysis.negative ? 'True' : 'False'}
                            </div>
                        </li>
                        {isNewEntry && (
                            <li className="py-4 px-8 flex items-center justify-between">
                                <button
                                    onClick={handleSave}
                                    type="button"
                                    className="rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500"
                                >
                                    Save & Return
                                </button>
                            </li>
                        )}
                        <li className="py-4 px-8 flex items-center justify-between">
                            <button
                                onClick={handleDelete}
                                type="button"
                                className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                            >
                                Delete
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Editor
