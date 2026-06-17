export default {
  name: 'Film Grain',
  id: 'filmGrain',
  category: 'POST PROCESS',
  enabled: false,
  animated: true,
  uniforms: {
    u_fg_intensity: { value: 0.4, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_fg_size: { value: 1.0, min: 0.5, max: 4, step: 0.1, label: 'Size' },
  },
  glsl: `
    vec4 applyFilmGrain(vec4 color, vec2 uv, float time) {
      vec2 seed = uv * u_resolution / u_fg_size + fract(time) * vec2(91.3, 47.7);
      float n = (hash21(seed) - 0.5) * u_fg_intensity;
      return vec4(color.rgb + n, color.a);
    }
  `,
}
