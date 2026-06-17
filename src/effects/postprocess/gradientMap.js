export default {
  name: 'Gradient Map',
  id: 'gradientMap',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_gm_c1: { value: [0.04, 0.0, 0.18], min: 0, max: 1, step: 0.01, label: 'Low', type: 'vec3', color: true },
    u_gm_c2: { value: [0.8, 0.2, 0.5], min: 0, max: 1, step: 0.01, label: 'Mid', type: 'vec3', color: true },
    u_gm_c3: { value: [1.0, 0.95, 0.8], min: 0, max: 1, step: 0.01, label: 'High', type: 'vec3', color: true },
    u_gm_intensity: { value: 1.0, min: 0, max: 1, step: 0.01, label: 'Intensity' },
  },
  glsl: `
    vec4 applyGradientMap(vec4 color, vec2 uv, float time) {
      float l = luma(color.rgb);
      vec3 grad = l < 0.5
        ? mix(u_gm_c1, u_gm_c2, l * 2.0)
        : mix(u_gm_c2, u_gm_c3, (l - 0.5) * 2.0);
      return vec4(mix(color.rgb, grad, u_gm_intensity), color.a);
    }
  `,
}
