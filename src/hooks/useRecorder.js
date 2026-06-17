import { useState, useCallback, useRef } from 'react'

/**
 * useRecorder — wraps MediaRecorder over canvas.captureStream(). Records for
 * `duration` ms (default 4s) then auto-exports a .webm download.
 */
export function useRecorder(canvasRef, { duration = 4000, fps = 30 } = {}) {
  const [isRecording, setRecording] = useState(false)
  const [progress, setProgress] = useState(0)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [error, setError] = useState(null)
  const recRef = useRef(null)

  const supported =
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    !!HTMLCanvasElement.prototype.captureStream

  const start = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || isRecording || !supported) return

    let mime = 'video/webm;codecs=vp9'
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm;codecs=vp8'
    if (!MediaRecorder.isTypeSupported(mime)) mime = 'video/webm'

    let stream
    try {
      stream = canvas.captureStream(fps)
    } catch (err) {
      setError('Canvas capture not available')
      return
    }

    let rec
    try {
      rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 })
    } catch (err) {
      setError('Recording not supported')
      return
    }
    recRef.current = rec
    const chunks = []

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size) chunks.push(e.data)
    }
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setRecordedUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return url
      })
      setRecording(false)
      setProgress(0)
      const a = document.createElement('a')
      a.href = url
      a.download = `effects-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      a.remove()
    }

    setError(null)
    setRecording(true)
    setProgress(0)
    rec.start()

    const t0 = performance.now()
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / duration)
      setProgress(p)
      if (p < 1 && rec.state === 'recording') requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    setTimeout(() => {
      if (rec.state === 'recording') rec.stop()
    }, duration)
  }, [canvasRef, isRecording, supported, duration, fps])

  return { isRecording, progress, recordedUrl, error, supported, start, duration }
}
