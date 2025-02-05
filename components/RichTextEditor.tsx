'use client'

import { useEditor, EditorContent, BubbleMenu, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useCallback, useRef, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import NextImage from 'next/image'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    placeholder?: string
}

interface ImageAdjustments {
    brightness: number
    contrast: number
    saturation: number
    blur: number
    hue: number
    sepia: number
}

interface AdjustmentHistory {
    past: ImageAdjustments[]
    present: ImageAdjustments
    future: ImageAdjustments[]
}

interface ImageCropDialogProps {
    imageUrl: string
    onCrop: (croppedImage: Blob, adjustments: ImageAdjustments) => void
    onCancel: () => void
}

const ADJUSTMENT_DESCRIPTIONS = {
    brightness: 'Adjusts the overall lightness or darkness of the image',
    contrast: 'Increases or decreases the difference between light and dark areas',
    saturation: 'Controls the intensity of colors, from grayscale to vibrant',
    blur: 'Adds softness or reduces sharpness of the image',
    hue: 'Shifts all colors in the image along the color spectrum',
    sepia: 'Adds a warm, brownish tone for a vintage look'
} as const

const PRESET_FILTERS = {
    // Basic Filters
    'Normal': {
        brightness: 100, contrast: 100, saturation: 100, blur: 0, hue: 0, sepia: 0
    },
    'Vintage': {
        brightness: 110, contrast: 85, saturation: 75, blur: 0, hue: 0, sepia: 50
    },
    'Summer': {
        brightness: 110, contrast: 110, saturation: 130, blur: 0, hue: 20, sepia: 0
    },
    'Dramatic': {
        brightness: 90, contrast: 140, saturation: 90, blur: 0, hue: 0, sepia: 20
    },
    'Cool': {
        brightness: 100, contrast: 100, saturation: 90, blur: 0, hue: 180, sepia: 0
    },
    // Specialized Filters
    'Food': {
        brightness: 110, contrast: 120, saturation: 140, blur: 0, hue: 10, sepia: 0
    },
    'Portrait': {
        brightness: 105, contrast: 95, saturation: 90, blur: 0.3, hue: 0, sepia: 10
    },
    'Landscape': {
        brightness: 105, contrast: 115, saturation: 120, blur: 0, hue: 355, sepia: 0
    },
    'Urban': {
        brightness: 95, contrast: 130, saturation: 85, blur: 0, hue: 190, sepia: 0
    },
    'Nature': {
        brightness: 105, contrast: 110, saturation: 130, blur: 0, hue: 15, sepia: 0
    }
} as const

const ADJUSTMENT_PRESETS = {
    'High Contrast': {
        brightness: 100, contrast: 150, saturation: 100, blur: 0, hue: 0, sepia: 0
    },
    'Low Contrast': {
        brightness: 100, contrast: 50, saturation: 100, blur: 0, hue: 0, sepia: 0
    },
    'High Saturation': {
        brightness: 100, contrast: 100, saturation: 150, blur: 0, hue: 0, sepia: 0
    },
    'Low Saturation': {
        brightness: 100, contrast: 100, saturation: 50, blur: 0, hue: 0, sepia: 0
    },
    'Soft Focus': {
        brightness: 105, contrast: 90, saturation: 90, blur: 1.5, hue: 0, sepia: 0
    }
} as const

const ImageCropDialog = ({ imageUrl, onCrop, onCancel }: ImageCropDialogProps) => {
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
    })
    const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentHistory>({
        past: [],
        present: PRESET_FILTERS.Normal,
        future: []
    })
    const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null)
    const imageRef = useRef<HTMLImageElement>(null)

    const pushToHistory = (newAdjustments: ImageAdjustments) => {
        setAdjustmentHistory(prev => ({
            past: [...prev.past, prev.present],
            present: newAdjustments,
            future: []
        }))
    }

    const undo = () => {
        setAdjustmentHistory(prev => {
            if (prev.past.length === 0) return prev
            const newPast = prev.past.slice(0, -1)
            const newPresent = prev.past[prev.past.length - 1]
            return {
                past: newPast,
                present: newPresent,
                future: [prev.present, ...prev.future]
            }
        })
    }

    const redo = () => {
        setAdjustmentHistory(prev => {
            if (prev.future.length === 0) return prev
            const newFuture = prev.future.slice(1)
            const newPresent = prev.future[0]
            return {
                past: [...prev.past, prev.present],
                present: newPresent,
                future: newFuture
            }
        })
    }

    const applyPreset = (presetName: keyof typeof PRESET_FILTERS) => {
        pushToHistory(PRESET_FILTERS[presetName])
    }

    const handleAdjustmentChange = (key: keyof ImageAdjustments, value: number) => {
        const newAdjustments = {
            ...adjustmentHistory.present,
            [key]: value
        }
        pushToHistory(newAdjustments)
    }

    useEffect(() => {
        const img = document.createElement('img')
        img.src = imageUrl
        img.onload = () => {
            const aspectRatio = crop.width / crop.height
            const previewWidth = Math.min(img.width * (crop.width / 100), 1920)
            const previewHeight = previewWidth / aspectRatio
            setPreviewDimensions({
                width: Math.round(previewWidth),
                height: Math.round(previewHeight),
            })
        }
    }, [imageUrl, crop])

    const handleCrop = async () => {
        if (!imageRef.current) return

        const canvas = document.createElement('canvas')
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height
        const pixelRatio = window.devicePixelRatio

        canvas.width = crop.width * scaleX
        canvas.height = crop.height * scaleY

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
        ctx.imageSmoothingQuality = 'high'

        // Apply image adjustments
        ctx.filter = `
            brightness(${adjustmentHistory.present.brightness}%)
            contrast(${adjustmentHistory.present.contrast}%)
            saturate(${adjustmentHistory.present.saturation}%)
            blur(${adjustmentHistory.present.blur}px)
            hue-rotate(${adjustmentHistory.present.hue}deg)
            sepia(${adjustmentHistory.present.sepia}%)
        `

        ctx.drawImage(
            imageRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width * scaleX,
            crop.height * scaleY
        )

        canvas.toBlob(
            (blob) => {
                if (blob) onCrop(blob, adjustmentHistory.present)
            },
            'image/webp',
            0.9
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Edit Image</h2>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-6">
                    <div>
                        <div className="mb-4">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                            >
                                <NextImage
                                    ref={imageRef as any}
                                    src={imageUrl}
                                    alt="Crop preview"
                                    width={800}
                                    height={600}
                                    style={{
                                        filter: `
                                            brightness(${adjustmentHistory.present.brightness}%)
                                            contrast(${adjustmentHistory.present.contrast}%)
                                            saturate(${adjustmentHistory.present.saturation}%)
                                            blur(${adjustmentHistory.present.blur}px)
                                            hue-rotate(${adjustmentHistory.present.hue}deg)
                                            sepia(${adjustmentHistory.present.sepia}%)
                                        `,
                                        maxWidth: '100%',
                                        height: 'auto',
                                    }}
                                    unoptimized
                                />
                            </ReactCrop>
                        </div>

                        {previewDimensions && (
                            <div className="text-sm text-gray-600 mb-4">
                                Final dimensions: {previewDimensions.width}px × {previewDimensions.height}px
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* Image Adjustments */}
                        {[
                            { key: 'brightness', label: 'Brightness', min: 0, max: 200, default: 100 },
                            { key: 'contrast', label: 'Contrast', min: 0, max: 200, default: 100 },
                            { key: 'saturation', label: 'Saturation', min: 0, max: 200, default: 100 },
                            { key: 'blur', label: 'Blur', min: 0, max: 10, default: 0 },
                            { key: 'hue', label: 'Hue Rotation', min: 0, max: 360, default: 0 },
                            { key: 'sepia', label: 'Sepia', min: 0, max: 100, default: 0 }
                        ].map(({ key, label, min, max, default: defaultValue }) => (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-2">
                                    <label
                                        className="text-sm font-medium text-gray-700 cursor-help"
                                        title={ADJUSTMENT_DESCRIPTIONS[key as keyof typeof ADJUSTMENT_DESCRIPTIONS]}
                                    >
                                        {label}
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500">
                                            {adjustmentHistory.present[key as keyof ImageAdjustments]}
                                        </span>
                                        <button
                                            onClick={() => handleAdjustmentChange(
                                                key as keyof ImageAdjustments,
                                                defaultValue
                                            )}
                                            className="p-1 text-xs text-gray-500 hover:text-gray-700"
                                            title={`Reset ${label} to default`}
                                        >
                                            ↺
                                        </button>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    value={adjustmentHistory.present[key as keyof ImageAdjustments]}
                                    onChange={(e) => handleAdjustmentChange(
                                        key as keyof ImageAdjustments,
                                        parseInt(e.target.value)
                                    )}
                                    className="w-full"
                                    title={`${label}: ${adjustmentHistory.present[key as keyof ImageAdjustments]}`}
                                />
                            </div>
                        ))}

                        {/* Adjustment Presets */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quick Adjustments
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(ADJUSTMENT_PRESETS).map(([preset, values]) => (
                                    <button
                                        key={preset}
                                        onClick={() => pushToHistory(values)}
                                        className={`px-3 py-2 rounded text-sm ${JSON.stringify(values) === JSON.stringify(adjustmentHistory.present)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preset Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filters
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(PRESET_FILTERS).map(([preset, values]) => (
                                    <button
                                        key={preset}
                                        onClick={() => applyPreset(preset as keyof typeof PRESET_FILTERS)}
                                        className={`px-3 py-2 rounded text-sm ${JSON.stringify(values) === JSON.stringify(adjustmentHistory.present)
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 hover:bg-gray-200'
                                            }`}
                                    >
                                        {preset}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Undo/Redo Controls */}
                        <div className="flex gap-2">
                            <button
                                onClick={undo}
                                disabled={adjustmentHistory.past.length === 0}
                                className="p-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                title="Undo"
                            >
                                ↩
                            </button>
                            <button
                                onClick={redo}
                                disabled={adjustmentHistory.future.length === 0}
                                className="p-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                                title="Redo"
                            >
                                ↪
                            </button>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCrop}
                                className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
                            >
                                Apply & Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [cropImage, setCropImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({
                placeholder,
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto',
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[200px] px-4 py-2',
            },
        },
        onUpdate: ({ editor }: { editor: Editor }) => {
            onChange(editor.getHTML())
        },
    })

    const handleImageUpload = useCallback(async (file: File) => {
        try {
            // Create object URL for cropping
            const imageUrl = URL.createObjectURL(file)
            setCropImage(imageUrl)
        } catch (error) {
            console.error('Failed to process image:', error)
        }
    }, [])

    const handleCroppedImage = useCallback(async (croppedBlob: Blob, adjustments: ImageAdjustments) => {
        try {
            const formData = new FormData()
            formData.append('file', croppedBlob)
            formData.append('brightness', adjustments.brightness.toString())
            formData.append('contrast', adjustments.contrast.toString())
            formData.append('saturation', adjustments.saturation.toString())

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) throw new Error('Upload failed')

            const { url } = await response.json()

            editor?.chain().focus().setImage({ src: url }).run()
        } catch (error) {
            console.error('Failed to upload image:', error)
        } finally {
            setCropImage(null)
        }
    }, [editor])

    const { getRootProps, isDragActive } = useDropzone({
        accept: {
            'image/*': []
        },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles?.[0]) {
                handleImageUpload(acceptedFiles[0])
            }
        }
    })

    const toggleBold = useCallback(() => {
        editor?.chain().focus().toggleBold().run()
    }, [editor])

    const toggleItalic = useCallback(() => {
        editor?.chain().focus().toggleItalic().run()
    }, [editor])

    const toggleStrike = useCallback(() => {
        editor?.chain().focus().toggleStrike().run()
    }, [editor])

    const toggleHighlight = useCallback(() => {
        editor?.chain().focus().toggleHighlight().run()
    }, [editor])

    const addEmoji = useCallback((emoji: any) => {
        editor?.chain().focus().insertContent(emoji.native).run()
        setShowEmojiPicker(false)
    }, [editor])

    if (!editor) {
        return null
    }

    return (
        <div className="relative border rounded-lg bg-white">
            {cropImage && (
                <ImageCropDialog
                    imageUrl={cropImage}
                    onCrop={handleCroppedImage}
                    onCancel={() => {
                        setCropImage(null)
                        URL.revokeObjectURL(cropImage)
                    }}
                />
            )}
            {editor && (
                <BubbleMenu
                    className="flex gap-1 p-1 bg-white border rounded-lg shadow-lg"
                    tippyOptions={{ duration: 100 }}
                    editor={editor}
                >
                    <button
                        onClick={toggleBold}
                        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''
                            }`}
                    >
                        <span className="font-bold">B</span>
                    </button>
                    <button
                        onClick={toggleItalic}
                        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''
                            }`}
                    >
                        <span className="italic">I</span>
                    </button>
                    <button
                        onClick={toggleStrike}
                        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''
                            }`}
                    >
                        <span className="line-through">S</span>
                    </button>
                    <button
                        onClick={toggleHighlight}
                        className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('highlight') ? 'bg-gray-200' : ''
                            }`}
                    >
                        <span className="bg-yellow-200">H</span>
                    </button>
                </BubbleMenu>
            )}
            <div className="sticky top-0 z-10 flex gap-2 p-2 bg-gray-50 border-b">
                <button
                    onClick={toggleBold}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''
                        }`}
                    title="Bold"
                >
                    <span className="font-bold">B</span>
                </button>
                <button
                    onClick={toggleItalic}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''
                        }`}
                    title="Italic"
                >
                    <span className="italic">I</span>
                </button>
                <button
                    onClick={toggleStrike}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''
                        }`}
                    title="Strikethrough"
                >
                    <span className="line-through">S</span>
                </button>
                <button
                    onClick={toggleHighlight}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('highlight') ? 'bg-gray-200' : ''
                        }`}
                    title="Highlight"
                >
                    <span className="bg-yellow-200">H</span>
                </button>
                <div className="w-px h-6 my-auto bg-gray-300" />
                <div className="relative">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded hover:bg-gray-100"
                        title="Add Emoji"
                    >
                        😊
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute top-full mt-1 z-50">
                            <Picker
                                data={data}
                                onEmojiSelect={addEmoji}
                                theme="light"
                            />
                        </div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={() => { }}
                    accept="image/*"
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded hover:bg-gray-100"
                    title="Add Image"
                >
                    📷
                </button>
                <select
                    onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                    className="px-2 py-1 border rounded"
                    title="Text Color"
                >
                    <option value="#000000">Default</option>
                    <option value="#958DF1">Purple</option>
                    <option value="#F98181">Red</option>
                    <option value="#FBBC88">Orange</option>
                    <option value="#FAF594">Yellow</option>
                    <option value="#70CFF8">Blue</option>
                    <option value="#94FADB">Teal</option>
                    <option value="#B9F18D">Green</option>
                </select>
                <button
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    className="px-2 py-1 text-sm text-gray-500 border rounded hover:bg-gray-100"
                    title="Clear Formatting"
                >
                    Clear Format
                </button>
            </div>
            <div {...getRootProps()} className="relative">
                <EditorContent editor={editor} />
                {isDragActive && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-500 border-dashed rounded-lg flex items-center justify-center">
                        <p className="text-blue-500 text-lg font-medium">Drop image here</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RichTextEditor 