// ---------------------------------------------------------------------------
// Pure helpers — hex <-> [r,g,b] floats (0..1)
// ---------------------------------------------------------------------------

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function floatRgbToHex([r, g, b]) {
  const toHex = (v) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, '0')
  return '#' + toHex(r) + toHex(g) + toHex(b)
}

function hexToFloatRgb(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ]
}

// Show ≤3 decimals, no trailing zeros
function formatFloat(v) {
  return parseFloat(v.toFixed(3)).toString()
}

// ---------------------------------------------------------------------------
// Uniform control sub-components
// ---------------------------------------------------------------------------

function FloatControl({ effectId, uName, uniform, onSetUniform }) {
  const isInt = uniform.step === 1 && uniform.max - uniform.min <= 100
  const displayVal = isInt ? String(Math.round(uniform.value)) : formatFloat(uniform.value)

  function handleChange(e) {
    const num = parseFloat(e.target.value)
    if (!isNaN(num)) onSetUniform(effectId, uName, num)
  }

  return (
    <div className="fx-control">
      <div className="fx-control-header">
        <span className="fx-control-label">{uniform.label}</span>
        <span className="fx-control-value">{displayVal}</span>
      </div>
      <input
        type="range"
        className="fx-slider"
        min={uniform.min}
        max={uniform.max}
        step={uniform.step}
        value={uniform.value}
        onChange={handleChange}
        aria-label={`${uniform.label} — ${effectId}`}
        aria-valuemin={uniform.min}
        aria-valuemax={uniform.max}
        aria-valuenow={uniform.value}
      />
    </div>
  )
}

function Vec2Control({ effectId, uName, uniform, onSetUniform }) {
  const [vx, vy] = Array.isArray(uniform.value) ? uniform.value : [0, 0]
  const min = uniform.min ?? 0
  const max = uniform.max ?? 1
  const step = uniform.step ?? 0.01

  function handleAxis(axisIdx, rawValue) {
    const num = parseFloat(rawValue)
    if (isNaN(num)) return
    const next = [vx, vy]
    next[axisIdx] = num
    onSetUniform(effectId, uName, next)
  }

  return (
    <div className="fx-control">
      <div className="fx-control-header">
        <span className="fx-control-label">{uniform.label}</span>
      </div>
      <div className="fx-control-vec2">
        <div className="fx-control-vec2-row">
          <span className="fx-control-vec2-axis">X</span>
          <input
            type="range"
            className="fx-slider"
            min={min}
            max={max}
            step={step}
            value={vx}
            onChange={(e) => handleAxis(0, e.target.value)}
            aria-label={`${uniform.label} X — ${effectId}`}
          />
          <span className="fx-control-vec2-val">{formatFloat(vx)}</span>
        </div>
        <div className="fx-control-vec2-row">
          <span className="fx-control-vec2-axis">Y</span>
          <input
            type="range"
            className="fx-slider"
            min={min}
            max={max}
            step={step}
            value={vy}
            onChange={(e) => handleAxis(1, e.target.value)}
            aria-label={`${uniform.label} Y — ${effectId}`}
          />
          <span className="fx-control-vec2-val">{formatFloat(vy)}</span>
        </div>
      </div>
    </div>
  )
}

function ColorControl({ effectId, uName, uniform, onSetUniform }) {
  const rgb = Array.isArray(uniform.value) ? uniform.value : [0, 0, 0]
  const hex = floatRgbToHex(rgb)

  function handleChange(e) {
    onSetUniform(effectId, uName, hexToFloatRgb(e.target.value))
  }

  return (
    <div className="fx-control">
      <div className="fx-control-header">
        <span className="fx-control-label">{uniform.label}</span>
      </div>
      <div className="fx-color-wrap">
        <input
          type="color"
          className="fx-color-input"
          value={hex}
          onChange={handleChange}
          aria-label={`${uniform.label} color — ${effectId}`}
        />
        <span className="fx-color-hex">{hex.toUpperCase()}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EffectToggle — renders the toggle switch + (when enabled) the controls panel
// ---------------------------------------------------------------------------

/**
 * Props:
 *   effect       — effectView object
 *   onToggle     — (id) => void
 *   onSetUniform — (id, uName, value) => void
 *   onReset      — (id) => void
 */
export default function EffectToggle({ effect, onToggle, onSetUniform, onReset }) {
  const inputId = `toggle-${effect.id}`
  const uniformEntries = Object.entries(effect.uniforms)

  return (
    <>
      {/* Accessible toggle switch */}
      <label
        className="fx-toggle"
        title={effect.enabled ? `Disable ${effect.name}` : `Enable ${effect.name}`}
      >
        <input
          id={inputId}
          type="checkbox"
          checked={effect.enabled}
          onChange={() => onToggle(effect.id)}
          aria-label={`${effect.name} — ${effect.enabled ? 'enabled' : 'disabled'}`}
        />
        <span
          className={`fx-toggle-track${effect.enabled ? ' fx-toggle-track--on' : ''}`}
          aria-hidden="true"
        >
          <span className={`fx-toggle-knob${effect.enabled ? ' fx-toggle-knob--on' : ''}`} />
        </span>
      </label>

      {/* Controls panel — only when enabled and uniforms exist */}
      {effect.enabled && uniformEntries.length > 0 && (
        <div className="fx-controls">
          <div className="fx-controls-inner">
            {uniformEntries.map(([uName, uniform]) => {
              if (uniform.type === 'vec3' && uniform.color) {
                return (
                  <ColorControl
                    key={uName}
                    effectId={effect.id}
                    uName={uName}
                    uniform={uniform}
                    onSetUniform={onSetUniform}
                  />
                )
              }
              if (uniform.type === 'vec2') {
                return (
                  <Vec2Control
                    key={uName}
                    effectId={effect.id}
                    uName={uName}
                    uniform={uniform}
                    onSetUniform={onSetUniform}
                  />
                )
              }
              // Default: float
              return (
                <FloatControl
                  key={uName}
                  effectId={effect.id}
                  uName={uName}
                  uniform={uniform}
                  onSetUniform={onSetUniform}
                />
              )
            })}
            <button
              type="button"
              className="fx-controls-reset"
              onClick={() => onReset(effect.id)}
              aria-label={`Reset ${effect.name} to defaults`}
            >
              Reset defaults
            </button>
          </div>
        </div>
      )}
    </>
  )
}
