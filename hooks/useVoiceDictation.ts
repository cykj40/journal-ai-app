import { useState, useRef, useCallback } from 'react'

type Status = 'idle' | 'recording' | 'transcribing' | 'error'

interface UseVoiceDictationReturn {
    status: Status
    startRecording: () => Promise<void>
    stopRecording: () => void
    isRecording: boolean
    isTranscribing: boolean
    error: string | null
}

export function useVoiceDictation(
    onTranscript: (text: string) => void
): UseVoiceDictationReturn {
    const [status, setStatus] = useState<Status>('idle')
    const [error, setError] = useState<string | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const startRecording = useCallback(async () => {
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm'

            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop())

                const audioBlob = new Blob(chunksRef.current, { type: mimeType })
                setStatus('transcribing')

                try {
                    const formData = new FormData()
                    formData.append('audio', audioBlob, 'recording.webm')

                    const res = await fetch('/api/transcribe', {
                        method: 'POST',
                        body: formData,
                    })

                    if (!res.ok) throw new Error('Transcription request failed')

                    const { text } = await res.json()
                    if (text) onTranscript(text)
                    setStatus('idle')
                } catch (err) {
                    console.error('[voiceDictation] transcription error:', err)
                    setError('Transcription failed. Try again.')
                    setStatus('error')
                }
            }

            mediaRecorder.start()
            setStatus('recording')
        } catch (err) {
            console.error('[voiceDictation] mic error:', err)
            setError('Microphone access denied.')
            setStatus('error')
        }
    }, [onTranscript])

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop()
        }
    }, [])

    return {
        status,
        startRecording,
        stopRecording,
        isRecording: status === 'recording',
        isTranscribing: status === 'transcribing',
        error,
    }
}
