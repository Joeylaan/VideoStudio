import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Global styles (load order: tokens/reset → regions → components)
import './styles/global.css'
import './styles/canvas.css'
import './styles/sidebar.css'
import './styles/effectCard.css'

// NOTE: StrictMode is intentionally omitted. It double-invokes effects in dev,
// which would spin up two WebGL contexts / rAF loops for the canvas.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
