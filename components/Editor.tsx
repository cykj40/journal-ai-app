'use client'
import { useState } from 'react'
import { useAutosave } from 'react-autosave'
import RichTextEditor from './RichTextEditor'

interface EditorProps {
    entry: {
        content: string
    }
    onSave: (content: string) => Promise<void>
}

const Editor = ({ entry, onSave }: EditorProps) => {
    const [value, setValue] = useState(entry.content)
    const [isSaving, setIsSaving] = useState(false)

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

    return (
        <div className="w-full h-full">
            <div className="h-full">
                <RichTextEditor
                    content={value}
                    onChange={setValue}
                    placeholder="Write your thoughts here..."
                />
            </div>
            <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                {isSaving ? 'Saving...' : 'Saved'}
            </div>
        </div>
    )
}

export default Editor
