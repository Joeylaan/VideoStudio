import { useRef } from 'react'
import Canvas from './components/Canvas.jsx'
import Sidebar from './components/Sidebar.jsx'
import { useEffects } from './hooks/useEffects.js'
import { useWebGL } from './hooks/useWebGL.js'
import { useRecorder } from './hooks/useRecorder.js'

export default function App() {
  const canvasRef = useRef(null)
  const fx = useEffects()
  const gl = useWebGL(canvasRef, fx.activeEffects)
  const recorder = useRecorder(canvasRef, { duration: 4000, fps: 30 })

  return (
    <div className="app">
      <Canvas
        canvasRef={canvasRef}
        onUpload={gl.loadImageFile}
        activeCount={fx.activeEffects.length}
      />
      <Sidebar
        categories={fx.CATEGORIES}
        effectsByCategory={fx.effectsByCategory}
        activeEffects={fx.activeEffects}
        onToggle={fx.toggle}
        onSetUniform={fx.setUniform}
        onReset={fx.resetEffect}
        onReorder={fx.reorder}
        onUpload={gl.loadImageFile}
        onClearAll={fx.clearAll}
        recorder={recorder}
        presets={fx.presets}
        onSavePreset={fx.savePreset}
        onApplyPreset={fx.applyPreset}
        onDeletePreset={fx.deletePreset}
      />
    </div>
  )
}
