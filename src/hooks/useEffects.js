import { useState, useCallback, useMemo } from 'react'
import { EFFECTS, CATEGORIES } from '../effects/index.js'

const PRESET_KEY = 'fx_presets_v1'

function clone(v) {
  return Array.isArray(v) ? v.slice() : v
}

// Build the mutable runtime state from the registry defaults.
function initState() {
  const byId = {}
  for (const e of EFFECTS) {
    const values = {}
    for (const [k, u] of Object.entries(e.uniforms)) values[k] = clone(u.value)
    byId[e.id] = { enabled: !!e.enabled, values }
  }
  return byId
}

// Merge live runtime values back onto the static registry meta → a "view".
function buildView(e, st) {
  const uniforms = {}
  for (const [k, u] of Object.entries(e.uniforms)) {
    uniforms[k] = { ...u, value: st?.values?.[k] ?? u.value }
  }
  return {
    id: e.id,
    name: e.name,
    category: e.category,
    animated: e.animated,
    glsl: e.glsl,
    enabled: !!st?.enabled,
    uniforms,
  }
}

function loadPresets() {
  try {
    return JSON.parse(localStorage.getItem(PRESET_KEY) || '[]')
  } catch {
    return []
  }
}

/**
 * useEffects — single source of truth for which effects are enabled, their
 * live uniform values, and the chain order. Drives both the sidebar UI and
 * the shader composition in useWebGL.
 */
export function useEffects() {
  const [byId, setById] = useState(initState)
  const [order, setOrder] = useState([]) // ids in enable order = chain order
  const [presets, setPresets] = useState(loadPresets)

  const toggle = useCallback((id) => {
    setById((prev) => ({ ...prev, [id]: { ...prev[id], enabled: !prev[id].enabled } }))
    setOrder((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const setUniform = useCallback((id, uName, value) => {
    setById((prev) => ({
      ...prev,
      [id]: { ...prev[id], values: { ...prev[id].values, [uName]: value } },
    }))
  }, [])

  const resetEffect = useCallback((id) => {
    const def = EFFECTS.find((e) => e.id === id)
    if (!def) return
    const values = {}
    for (const [k, u] of Object.entries(def.uniforms)) values[k] = clone(u.value)
    setById((prev) => ({ ...prev, [id]: { ...prev[id], values } }))
  }, [])

  const reorder = useCallback((from, to) => {
    setOrder((prev) => {
      if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev
      const next = prev.slice()
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  const effectsByCategory = useMemo(() => {
    const map = {}
    for (const cat of CATEGORIES) map[cat] = []
    for (const e of EFFECTS) map[e.category].push(buildView(e, byId[e.id]))
    return map
  }, [byId])

  const activeEffects = useMemo(
    () =>
      order
        .filter((id) => byId[id]?.enabled)
        .map((id) => buildView(EFFECTS.find((e) => e.id === id), byId[id])),
    [order, byId],
  )

  const anyAnimated = useMemo(() => activeEffects.some((e) => e.animated), [activeEffects])

  // ---- Presets (localStorage) ----
  const persistPresets = useCallback((list) => {
    setPresets(list)
    try {
      localStorage.setItem(PRESET_KEY, JSON.stringify(list))
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [])

  const savePreset = useCallback(
    (name) => {
      if (!name) return
      const state = {}
      for (const [id, s] of Object.entries(byId)) {
        if (s.enabled) state[id] = { enabled: true, values: s.values }
      }
      const snapshot = { name, order: order.slice(), state }
      persistPresets([...presets.filter((p) => p.name !== name), snapshot])
    },
    [byId, order, presets, persistPresets],
  )

  const applyPreset = useCallback(
    (name) => {
      const p = presets.find((x) => x.name === name)
      if (!p) return
      const base = initState()
      for (const [id, s] of Object.entries(p.state)) {
        if (base[id]) {
          base[id].enabled = !!s.enabled
          base[id].values = { ...base[id].values, ...s.values }
        }
      }
      setById(base)
      setOrder((p.order || []).filter((id) => base[id]))
    },
    [presets],
  )

  const deletePreset = useCallback(
    (name) => persistPresets(presets.filter((p) => p.name !== name)),
    [presets, persistPresets],
  )

  const clearAll = useCallback(() => {
    setById(initState())
    setOrder([])
  }, [])

  return {
    CATEGORIES,
    effectsByCategory,
    activeEffects,
    order,
    toggle,
    setUniform,
    resetEffect,
    reorder,
    anyAnimated,
    presets,
    savePreset,
    applyPreset,
    deletePreset,
    clearAll,
  }
}
