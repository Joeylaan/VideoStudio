export default {
  name: 'Gradient',
  id: 'gradient',
  category: 'GENERATIVE',
  enabled: false,
  animated: false,
  uniforms: {
    u_gd_colorA: { value: [0.5, 0.1, 0.8], min: 0, max: 1, step: 0.01, label: 'Color A', type: 'vec3', color: true },
    u_gd_colorB: { value: [0.1, 0.6, 0.9], min: 0, max: 1, step: 0.01, label: 'Color B', type: 'vec3', color: true },
    u_gd_angle: { value: 0.8, min: 0, max: 6.2831853, step: 0.05, label: 'Angle' },
    u_gd_intensity: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Intensity' },
  },
  glsl: `
    vec4 applyGradient(vec4 color, vec2 uv, float time) {
      vec2 dir = vec2(cos(u_gd_angle), sin(u_gd_angle));
      float t = clamp(dot(uv - 0.5, dir) + 0.5, 0.0, 1.0);
      vec3 g = mix(u_gd_colorA, u_gd_colorB, t);
      return vec4(mix(color.rgb, g, u_gd_intensity), color.a);
    }
  `,
}
