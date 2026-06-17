// =====================================================================
//  Effect registry — every effect module exports a default object:
//  { name, id, category, enabled, animated, glsl, uniforms }
//  See README + composer.frag.glsl for the GLSL contract.
// =====================================================================

// DISTORT
import fbm from './distort/fbm.js'
import waterRipple from './distort/waterRipple.js'
import liquify from './distort/liquify.js'
import ripple from './distort/ripple.js'
import sineWaves from './distort/sineWaves.js'
import swirl from './distort/swirl.js'
import lensDistort from './distort/lensDistort.js'
import pixelate from './distort/pixelate.js'
import noise from './distort/noise.js'
import waves from './distort/waves.js'

// POST PROCESS
import filmGrain from './postprocess/filmGrain.js'
import grain from './postprocess/grain.js'
import vignette from './postprocess/vignette.js'
import chromaticAberration from './postprocess/chromaticAberration.js'
import bloom from './postprocess/bloom.js'
import duotone from './postprocess/duotone.js'
import hologram from './postprocess/hologram.js'
import gradientMap from './postprocess/gradientMap.js'
import halftone from './postprocess/halftone.js'
import ninetiesVhs from './postprocess/ninetiesVhs.js'
import dither from './postprocess/dither.js'
import godRays from './postprocess/godRays.js'
import adjust from './postprocess/adjust.js'

// BLUR
import blur from './blur/blur.js'
import motionBlur from './blur/motionBlur.js'
import bokeh from './blur/bokeh.js'
import zoomBlur from './blur/zoomBlur.js'
import radialBlur from './blur/radialBlur.js'
import fog from './blur/fog.js'
import progressiveBlur from './blur/progressiveBlur.js'

// GENERATIVE
import aurora from './generative/aurora.js'
import nebula from './generative/nebula.js'
import wisps from './generative/wisps.js'
import noiseFill from './generative/noiseFill.js'
import gradient from './generative/gradient.js'
import beam from './generative/beam.js'
import waterCaustics from './generative/waterCaustics.js'

export const CATEGORIES = ['DISTORT', 'POST PROCESS', 'BLUR', 'GENERATIVE']

export const EFFECTS = [
  // DISTORT
  fbm, waterRipple, liquify, ripple, sineWaves, swirl, lensDistort, pixelate, noise, waves,
  // POST PROCESS
  filmGrain, grain, vignette, chromaticAberration, bloom, duotone, hologram, gradientMap,
  halftone, ninetiesVhs, dither, godRays, adjust,
  // BLUR
  blur, motionBlur, bokeh, zoomBlur, radialBlur, fog, progressiveBlur,
  // GENERATIVE
  aurora, nebula, wisps, noiseFill, gradient, beam, waterCaustics,
]

export const EFFECTS_BY_ID = Object.fromEntries(EFFECTS.map((e) => [e.id, e]))
