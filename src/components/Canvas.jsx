import { useRef, useState } from 'react'

/**
 * Canvas.jsx — owns the <canvas> ref handed to useWebGL, plus a small
 * toolbar (brand, active-effect count, upload) and drag-and-drop loading.
 */
export default function Canvas({ canvasRef, onUpload, activeCount }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const pickFile = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) onUpload(file)
  }

  return (
    <div
      className={'canvas-area' + (dragging ? ' dragging' : '')}
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault()
        if (!dragging) setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
    >
      <div className="canvas-toolbar">
        <span className="brand">
          <span className="brand-dot" aria-hidden="true" />
          Effects Studio
        </span>
        <div className="toolbar-actions">
          <span className="active-pill">{activeCount} active</span>
          <button className="upload-btn" onClick={() => inputRef.current?.click()}>
            <UploadIcon />
            Upload image
          </button>
        </div>
      </div>

      <div className="canvas-stage">
        <canvas ref={canvasRef} className="gl-canvas" />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={pickFile}
        aria-label="Upload an image"
      />
      <p className="canvas-hint">
        Drop an image anywhere or click Upload. A demo image is loaded by default — toggle
        effects on the right and hit record to export a 4-second .webm.
      </p>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}
