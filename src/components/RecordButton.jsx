// RecordButton — sticky footer, full-width recording control
// recorder shape: { isRecording, progress (0..1), recordedUrl, supported, start(), duration }

export default function RecordButton({ recorder }) {
  const { isRecording, progress, supported, start, duration } = recorder

  const durationSec = Math.round((duration ?? 4000) / 1000)

  if (!supported) {
    return (
      <button
        type="button"
        className="record-btn"
        disabled
        aria-disabled="true"
        aria-label="Recording unsupported in this browser"
      >
        {/* Camera-off icon */}
        <span className="record-btn-icon" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="2" y1="2" x2="22" y2="22" />
            <path d="M16 16H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" />
            <path d="M22 12l-4-4v8l4-4z" />
          </svg>
        </span>
        Recording unsupported
      </button>
    )
  }

  if (isRecording) {
    const pct = Math.round(progress * 100)
    return (
      <button
        type="button"
        className="record-btn record-btn--recording"
        disabled
        aria-disabled="true"
        aria-label={`Recording in progress — ${pct}%`}
        aria-live="polite"
      >
        <span className="record-dot record-dot--pulsing" aria-hidden="true" />
        Recording… {pct}%
        {/* Progress bar along bottom edge */}
        <span
          className="record-btn-progress"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Recording progress"
        />
      </button>
    )
  }

  return (
    <button
      type="button"
      className="record-btn"
      onClick={start}
      aria-label={`Export ${durationSec}s WebM recording`}
    >
      {/* Record circle icon */}
      <span className="record-btn-icon" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
        </svg>
      </span>
      Export .webm ({durationSec}s)
    </button>
  )
}
