import { useState, useRef } from 'react'
import EffectCard from './EffectCard.jsx'
import RecordButton from './RecordButton.jsx'

// ---------------------------------------------------------------------------
// ChainRow — one active effect in the reorder panel
// ---------------------------------------------------------------------------

function ChainRow({ effect, index, total, onReorder }) {
  const dragSrc = useRef(null)

  function handleDragStart(e) {
    dragSrc.current = index
    e.dataTransfer.effectAllowed = 'move'
    // Store index in dataTransfer as fallback
    e.dataTransfer.setData('text/plain', String(index))
    e.currentTarget.style.opacity = '0.5'
  }

  function handleDragEnd(e) {
    e.currentTarget.style.opacity = ''
    // Remove drag-over styling from all rows
    document.querySelectorAll('.sidebar-chain-row').forEach((el) => el.classList.remove('drag-over'))
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    e.currentTarget.classList.add('drag-over')
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over')
  }

  function handleDrop(e) {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    const from = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(from) && from !== index) {
      onReorder(from, index)
    }
    dragSrc.current = null
  }

  return (
    <li
      className="sidebar-chain-row"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag handle icon */}
      <span className="chain-drag-handle" aria-hidden="true">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
      </span>

      <span className="chain-row-index" aria-hidden="true">
        {index + 1}
      </span>

      <span className="chain-row-name">{effect.name}</span>

      <span className="chain-row-actions">
        <button
          type="button"
          className="chain-reorder-btn"
          onClick={() => onReorder(index, index - 1)}
          disabled={index === 0}
          aria-label={`Move ${effect.name} up in chain`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <button
          type="button"
          className="chain-reorder-btn"
          onClick={() => onReorder(index, index + 1)}
          disabled={index === total - 1}
          aria-label={`Move ${effect.name} down in chain`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// PresetsPanel
// ---------------------------------------------------------------------------

function PresetsPanel({ presets, onSavePreset, onApplyPreset, onDeletePreset }) {
  const [open, setOpen] = useState(true)
  const [name, setName] = useState('')

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSavePreset(trimmed)
    setName('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
  }

  return (
    <section className="sidebar-presets" aria-label="Presets">
      <div className="sidebar-presets-header">
        <span className="sidebar-presets-title">Presets</span>
        <button
          type="button"
          className="sidebar-presets-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="presets-body"
        >
          {open ? (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      {open && (
        <div id="presets-body" className="sidebar-presets-body">
          <div className="presets-save-row">
            <input
              type="text"
              className="presets-name-input"
              placeholder="Preset name…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Preset name"
              maxLength={48}
            />
            <button
              type="button"
              className="presets-save-btn"
              onClick={handleSave}
              disabled={!name.trim()}
              aria-label="Save current effects as preset"
            >
              Save
            </button>
          </div>

          {presets.length > 0 && (
            <div className="presets-chips" role="list" aria-label="Saved presets">
              {presets.map((preset) => (
                <div key={preset.name} className="preset-chip" role="listitem">
                  <button
                    type="button"
                    className="preset-chip-name"
                    onClick={() => onApplyPreset(preset.name)}
                    aria-label={`Apply preset: ${preset.name}`}
                    title={preset.name}
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    className="preset-chip-del"
                    onClick={() => onDeletePreset(preset.name)}
                    aria-label={`Delete preset: ${preset.name}`}
                    title="Delete preset"
                  >
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

// Category render order matches the CATEGORIES constant from useEffects
const CATEGORY_ORDER = ['DISTORT', 'POST PROCESS', 'BLUR', 'GENERATIVE']

export default function Sidebar({
  categories,
  effectsByCategory,
  activeEffects,
  onToggle,
  onSetUniform,
  onReset,
  onReorder,
  onUpload,
  onClearAll,
  recorder,
  presets,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}) {
  const fileInputRef = useRef(null)
  const enabledCount = activeEffects.length

  // Use the categories prop if provided, otherwise fall back to the fixed order
  const orderedCategories = (categories && categories.length > 0) ? categories : CATEGORY_ORDER

  function handleUploadClick() {
    fileInputRef.current?.click()
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    onUpload(file)
    // Reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <aside className="sidebar" aria-label="Effects sidebar">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sidebar-file-input"
        onChange={handleFileChange}
        aria-label="Upload image file"
        tabIndex={-1}
      />

      {/* ---- Header ---- */}
      <header className="sidebar-header">
        <div className="sidebar-title">
          EFFECTS
          <span
            className={`sidebar-count${enabledCount === 0 ? ' sidebar-count--zero' : ''}`}
            aria-label={`${enabledCount} effect${enabledCount === 1 ? '' : 's'} active`}
          >
            {enabledCount}
          </span>
        </div>
        <button
          type="button"
          className="sidebar-upload-btn"
          onClick={handleUploadClick}
          aria-label="Upload image"
          title="Upload image"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload
        </button>
      </header>

      {/* ---- Active chain panel ---- */}
      {activeEffects.length > 0 && (
        <section className="sidebar-chain" aria-label="Active effects chain order">
          <div className="sidebar-chain-header">
            <span className="sidebar-chain-title">Active — Chain Order</span>
            <button
              type="button"
              className="sidebar-chain-clear"
              onClick={onClearAll}
              aria-label="Clear all active effects"
            >
              Clear all
            </button>
          </div>
          <ol className="sidebar-chain-list" aria-label="Effect chain">
            {activeEffects.map((effect, idx) => (
              <ChainRow
                key={effect.id}
                effect={effect}
                index={idx}
                total={activeEffects.length}
                onReorder={onReorder}
              />
            ))}
          </ol>
        </section>
      )}

      {/* ---- Presets panel ---- */}
      <PresetsPanel
        presets={presets}
        onSavePreset={onSavePreset}
        onApplyPreset={onApplyPreset}
        onDeletePreset={onDeletePreset}
      />

      {/* ---- Scrollable effect grid ---- */}
      <div className="sidebar-body scroll-y" role="region" aria-label="All effects">
        {orderedCategories.map((category) => {
          const effects = effectsByCategory[category]
          if (!effects || effects.length === 0) return null

          return (
            <section key={category} className="fx-category-section">
              <h2 className="fx-category-label" aria-label={`${category} effects`}>
                {category}
              </h2>
              <div
                className="fx-category-grid"
                role="list"
                aria-label={`${category} effect cards`}
              >
                {effects.map((effect) => (
                  <div key={effect.id} role="listitem">
                    <EffectCard
                      effect={effect}
                      onToggle={onToggle}
                      onSetUniform={onSetUniform}
                      onReset={onReset}
                    />
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {/* ---- Footer: Record button ---- */}
      <footer className="sidebar-footer">
        <RecordButton recorder={recorder} />
      </footer>
    </aside>
  )
}
