export default {
  name: 'Duotone',
  id: 'duotone',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_dt_colorA: { value: [0.05, 0.05, 0.2], min: 0, max: 1, step: 0.01, label: 'Shadow', type: 'vec3', color: true },
    u_dt_colorB: { value: [1.0, 0.42, 0.7], min: 0, max: 1, step: 0.01, label: 'Highlight', type: 'vec3', color: true },
    u_dt_intensity: { value: 1.0, min: 0, max: 1, step: 0.01, label: 'Intensity' },
  },
  glsl: `
    vec4 applyDuotone(vec4 color, vec2 uv, float time) {
      float l = luma(color.rgb);
      vec3 duo = mix(u_dt_colorA, u_dt_colorB, l);
      return vec4(mix(color.rgb, duo, u_dt_intensity), color.a);
    }
  `,
}
