import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// .glsl shaders are imported as raw strings using the built-in `?raw` suffix,
// e.g. `import src from './composer.frag.glsl?raw'` — no extra plugin required.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, host: true },
})
