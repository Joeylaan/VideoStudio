import { useEffect, useRef, useState, useCallback } from 'react'
import baseVert from '../shaders/base.vert.glsl?raw'
import composerTemplate from '../shaders/composer.frag.glsl?raw'

const MAX_DIM = 1280 // cap texture/canvas long edge for perf + recording

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function uniformType(u) {
  if (u.type) return u.type
  if (Array.isArray(u.value)) {
    return u.value.length === 2 ? 'vec2' : u.value.length === 3 ? 'vec3' : 'vec4'
  }
  return 'float'
}

function compileShader(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    const numbered = src
      .split('\n')
      .map((l, i) => String(i + 1).padStart(3, ' ') + ' | ' + l)
      .join('\n')
    console.error('[useWebGL] shader compile failed:\n' + log + '\n' + numbered)
    gl.deleteShader(sh)
    return null
  }
  return sh
}

// Build a single-effect fragment shader. In the multi-pass pipeline, u_texture
// is the *previous pass's* output, so every effect layers on the accumulated
// result — distort/blur sample the running image, not the original source.
function buildEffectFragment(e) {
  let uniforms = ''
  for (const [name, u] of Object.entries(e.uniforms)) {
    uniforms += `uniform ${uniformType(u)} ${name};\n`
  }
  return composerTemplate
    .replace('/* __UNIFORMS__ */', uniforms)
    .replace('/* __FUNCTIONS__ */', e.glsl.trim())
    .replace('/* __CHAIN__ */', `  color = apply${cap(e.id)}(color, uv, u_time);\n`)
}

// Passthrough (no effects): just blit the source texture to the screen.
function buildPassthroughFragment() {
  return composerTemplate
    .replace('/* __UNIFORMS__ */', '')
    .replace('/* __FUNCTIONS__ */', '')
    .replace('/* __CHAIN__ */', '')
}

// A colorful default image so effects are visible before the user uploads one.
function makeDefaultImage() {
  const c = document.createElement('canvas')
  c.width = 1280
  c.height = 800
  const x = c.getContext('2d')
  const g = x.createLinearGradient(0, 0, 1280, 800)
  g.addColorStop(0, '#3a1c71')
  g.addColorStop(0.5, '#d76d77')
  g.addColorStop(1, '#ffaf7b')
  x.fillStyle = g
  x.fillRect(0, 0, 1280, 800)
  const blobs = [
    ['#7c5cbf', 300, 240, 280],
    ['#2ec5ff', 980, 250, 240],
    ['#ff5d8f', 640, 600, 320],
    ['#ffd76b', 1060, 660, 180],
    ['#43e0a0', 180, 640, 200],
  ]
  x.globalCompositeOperation = 'lighter'
  for (const [col, bx, by, r] of blobs) {
    const rg = x.createRadialGradient(bx, by, 0, bx, by, r)
    rg.addColorStop(0, col)
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = rg
    x.beginPath()
    x.arc(bx, by, r, 0, Math.PI * 2)
    x.fill()
  }
  x.globalCompositeOperation = 'source-over'
  return c
}

/**
 * useWebGL — owns the WebGL context, the source image texture, and a multi-pass
 * ping-pong render pipeline. Each enabled effect is its own shader pass that reads
 * the previous pass's output and writes to an offscreen framebuffer; the last pass
 * draws to the screen. This makes every effect genuinely layer on top of the prior
 * ones (a blur blurs the recoloured image, a distortion warps the bloomed image…).
 * Per-effect programs are compiled lazily and cached; uniform values upload live.
 */
export function useWebGL(canvasRef, activeEffects) {
  const glRef = useRef(null)
  const vsRef = useRef(null)
  const bufRef = useRef(null)
  const sourceTexRef = useRef(null)
  const targetsRef = useRef(null) // { texA, fboA, texB, fboB, w, h }
  const progCacheRef = useRef(new Map()) // effectId | '__passthrough__' → { program, loc }
  const activeRef = useRef(activeEffects)
  const rafRef = useRef(0)
  const startRef = useRef(0)
  const sizeRef = useRef({ w: 1280, h: 800 })
  const [hasImage, setHasImage] = useState(false)

  // keep the latest effect list available to the rAF loop without re-subscribing
  activeRef.current = activeEffects

  const makeTex = useCallback((gl, w, h) => {
    const t = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    return t
  }, [])

  // (Re)allocate the two ping-pong render targets at the given size.
  const ensureTargets = useCallback(
    (w, h) => {
      const gl = glRef.current
      if (!gl) return
      const cur = targetsRef.current
      if (cur && cur.w === w && cur.h === h) return
      if (cur) {
        gl.deleteTexture(cur.texA)
        gl.deleteTexture(cur.texB)
        gl.deleteFramebuffer(cur.fboA)
        gl.deleteFramebuffer(cur.fboB)
      }
      const mk = () => {
        const tex = makeTex(gl, w, h)
        const fbo = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
        return { tex, fbo }
      }
      const a = mk()
      const b = mk()
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
      if (status !== gl.FRAMEBUFFER_COMPLETE) {
        console.warn('[useWebGL] framebuffer incomplete:', status)
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      targetsRef.current = { texA: a.tex, fboA: a.fbo, texB: b.tex, fboB: b.fbo, w, h }
    },
    [makeTex],
  )

  const uploadTexture = useCallback(
    (src, w, h) => {
      const gl = glRef.current
      if (!gl) return
      const scale = Math.min(1, MAX_DIM / Math.max(w, h))
      const tw = Math.max(1, Math.round(w * scale))
      const th = Math.max(1, Math.round(h * scale))
      const tmp = document.createElement('canvas')
      tmp.width = tw
      tmp.height = th
      tmp.getContext('2d').drawImage(src, 0, 0, tw, th)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.bindTexture(gl.TEXTURE_2D, sourceTexRef.current)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tmp)
      sizeRef.current = { w: tw, h: th }
      const canvas = canvasRef.current
      canvas.width = tw
      canvas.height = th
      ensureTargets(tw, th)
    },
    [canvasRef, ensureTargets],
  )

  const loadImage = useCallback(
    (img) => {
      uploadTexture(img, img.naturalWidth || img.width, img.naturalHeight || img.height)
      setHasImage(true)
    },
    [uploadTexture],
  )

  const loadImageFile = useCallback(
    (file) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        loadImage(img)
        URL.revokeObjectURL(url)
      }
      img.onerror = () => URL.revokeObjectURL(url)
      img.src = url
    },
    [loadImage],
  )

  // Lazily compile + cache a program for one effect (or the passthrough blit).
  const getProgram = useCallback((e) => {
    const gl = glRef.current
    if (!gl || !vsRef.current) return null
    const key = e ? e.id : '__passthrough__'
    const cache = progCacheRef.current
    if (cache.has(key)) return cache.get(key)
    const frag = e ? buildEffectFragment(e) : buildPassthroughFragment()
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, frag)
    if (!fs) return null
    const program = gl.createProgram()
    gl.attachShader(program, vsRef.current)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('[useWebGL] program link failed:', gl.getProgramInfoLog(program))
      gl.deleteProgram(program)
      gl.deleteShader(fs)
      return null
    }
    gl.deleteShader(fs)
    const loc = {
      aPos: gl.getAttribLocation(program, 'a_position'),
      u_texture: gl.getUniformLocation(program, 'u_texture'),
      u_time: gl.getUniformLocation(program, 'u_time'),
      u_resolution: gl.getUniformLocation(program, 'u_resolution'),
      u: {},
    }
    if (e) {
      for (const name of Object.keys(e.uniforms)) loc.u[name] = gl.getUniformLocation(program, name)
    }
    const entry = { program, loc }
    cache.set(key, entry)
    return entry
  }, [])

  // ---- one-time GL init + render loop ----
  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl', {
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      antialias: false,
      alpha: false,
    })
    if (!gl) {
      console.error('[useWebGL] WebGL not supported in this browser')
      return
    }
    glRef.current = gl

    const buf = gl.createBuffer()
    bufRef.current = buf
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    vsRef.current = compileShader(gl, gl.VERTEX_SHADER, baseVert)

    sourceTexRef.current = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, sourceTexRef.current)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const def = makeDefaultImage()
    uploadTexture(def, def.width, def.height)
    startRef.current = performance.now()

    // Render one full-screen pass: read `readTex`, apply `entry`'s effect, write
    // to `writeFbo` (null = screen).
    const drawPass = (entry, readTex, writeFbo, e, w, h, time) => {
      gl.useProgram(entry.program)
      gl.bindBuffer(gl.ARRAY_BUFFER, bufRef.current)
      gl.enableVertexAttribArray(entry.loc.aPos)
      gl.vertexAttribPointer(entry.loc.aPos, 2, gl.FLOAT, false, 0, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, writeFbo)
      gl.viewport(0, 0, w, h)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, readTex)
      gl.uniform1i(entry.loc.u_texture, 0)
      gl.uniform1f(entry.loc.u_time, time)
      gl.uniform2f(entry.loc.u_resolution, w, h)
      if (e) {
        for (const [name, u] of Object.entries(e.uniforms)) {
          const l = entry.loc.u[name]
          if (l == null) continue
          const v = u.value
          if (Array.isArray(v)) {
            if (v.length === 2) gl.uniform2fv(l, v)
            else if (v.length === 3) gl.uniform3fv(l, v)
            else gl.uniform4fv(l, v)
          } else {
            gl.uniform1f(l, v)
          }
        }
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    const render = () => {
      const g = glRef.current
      if (g && vsRef.current && sourceTexRef.current) {
        const { w, h } = sizeRef.current
        const time = (performance.now() - startRef.current) / 1000

        // resolve programs up front so a failed compile doesn't desync ping-pong
        const passes = []
        for (const e of activeRef.current) {
          if (!e || !e.glsl) continue
          const entry = getProgram(e)
          if (entry) passes.push({ e, entry })
        }

        if (passes.length === 0) {
          const pass = getProgram(null)
          if (pass) drawPass(pass, sourceTexRef.current, null, null, w, h, time)
        } else {
          if (!targetsRef.current) ensureTargets(w, h)
          const t = targetsRef.current
          let readTex = sourceTexRef.current
          for (let i = 0; i < passes.length; i++) {
            const last = i === passes.length - 1
            const writeFbo = last ? null : i % 2 === 0 ? t.fboA : t.fboB
            drawPass(passes[i].entry, readTex, writeFbo, passes[i].e, w, h, time)
            if (!last) readTex = i % 2 === 0 ? t.texA : t.texB
          }
        }
      }
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      // Intentionally NOT calling WEBGL_lose_context: during Vite Fast-Refresh the
      // hook remounts onto the SAME canvas DOM node, and losing the context would
      // poison it (getContext returns the lost context → compiles fail). The GPU
      // context is reclaimed when the canvas is garbage-collected. This cleanup
      // only runs on unmount/HMR, never during normal production use.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { loadImage, loadImageFile, hasImage, dimensions: sizeRef.current }
}
