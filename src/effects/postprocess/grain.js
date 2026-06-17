export default {
  name: 'Grain',
  id: 'grain',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_gr_intensity: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_gr_size: { value: 1.0, min: 0.5, max: 4, step: 0.1, label: 'Size' },
  },
  glsl: `
    vec4 applyGrain(vec4 color, vec2 uv, float time) {
      float n = (hash21(floor(uv * u_resolution / u_gr_size)) - 0.5) * u_gr_intensity;
      return vec4(color.rgb + n, color.a);
    }
  `,
}
