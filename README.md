# WebGL Effects Studio

A browser-based WebGL image-effects tool with video export, inspired by Unicorn
Studio's effect library. Upload an image (or use the built-in demo), stack effects
across four categories, tune their parameters live, and export a 4-second `.webm`.

Built with **Vite + React 18** and hand-written **WebGL1 / GLSL ES 1.0** — no
Three.js, no WebGL helper libraries.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## How it works

- **`useEffects`** is the single source of truth: which effects are enabled, their
  live uniform values, and the chain order.
- **`useWebGL`** owns the GL context, the image texture, the requestAnimationFrame
  loop, and a **multi-pass ping-pong pipeline**. Each enabled effect is its own
  shader pass: it reads the previous pass's output texture, applies its GLSL
  function, and writes to an offscreen framebuffer; the last pass draws to the
  screen. This makes every effect genuinely *layer* on the accumulated result — a
  blur blurs the recoloured image, a distortion warps the bloomed image, and so on.
  Per-effect programs are compiled lazily and cached; slider drags just upload new
  uniform values each frame (no recompile).
- **`useRecorder`** wraps `MediaRecorder` over `canvas.captureStream()` and exports
  a `.webm` after 4 seconds.

## Effect module contract

Every effect (`src/effects/<category>/<id>.js`) default-exports:

```js
export default {
  name: 'Film Grain',
  id: 'filmGrain',          // function becomes apply + Capitalized id → applyFilmGrain
  category: 'POST PROCESS', // DISTORT | POST PROCESS | BLUR | GENERATIVE
  enabled: false,
  animated: true,           // true if it reads `time` (u_time)
  uniforms: {
    u_fg_intensity: { value: 0.4, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    // vec3 colors:  { value: [r,g,b], type: 'vec3', color: true, ... }
    // vec2 points:  { value: [x,y],   type: 'vec2', ... }
  },
  glsl: `
    vec4 applyFilmGrain(vec4 color, vec2 uv, float time) {
      // reads its u_* uniforms as globals; returns modified color
      return color;
    }
  `,
}
```

### GLSL rules for effect authors

- Expose exactly one function: `vec4 apply<Id>(vec4 color, vec2 uv, float time)`.
- Read your uniforms as globals (declared automatically from `uniforms`).
- Shared prelude helpers are available — **do not redefine them**:
  `hash21`, `vnoise`, `fbm`, `rot2`, `luma`, `rgb2hsv`, `hsv2rgb`, `aspect()`,
  plus globals `u_texture`, `u_resolution`, `u_time`, `v_uv`.
- Need a custom helper? Prefix it with your effect id (e.g. `fbm_sum`).
- `u_texture` is the **previous pass's output** (the source image for the first
  effect). POST/GENERATIVE effects transform the incoming `color`; DISTORT/BLUR
  effects re-sample `u_texture` at displaced/neighbouring UVs. Because of the
  multi-pass pipeline, all of them compose — every effect layers on top of the
  effects before it, and chain order changes the visual result.

## Effects (37)

- **DISTORT** — FBM, Water Ripple, Liquify, Ripple, Sine Waves, Swirl, Lens Distort,
  Pixelate, Noise, Waves
- **POST PROCESS** — Film Grain, Grain, Vignette, Chromatic Aberration, Bloom,
  Duotone, Hologram, Gradient Map, Halftone, Nineties VHS, Dither, God Rays, Adjust
- **BLUR** — Blur, Motion Blur, Bokeh, Zoom Blur, Radial Blur, Fog, Progressive Blur
- **GENERATIVE** — Aurora, Nebula, Wisps, Noise Fill, Gradient, Beam, Water Caustics

## Features

- Drag-and-drop or click to upload any image (demo image loaded by default).
- 2-column effect grid with live parameter sliders, color pickers, and XY pads.
- Reorderable active-effect chain (drag or arrow buttons) — changes blend order.
- Save / load named presets to `localStorage`.
- One-click 4-second `.webm` export with a pulsing record indicator.
