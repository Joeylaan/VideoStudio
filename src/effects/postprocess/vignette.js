export default {
  name: 'Vignette',
  id: 'vignette',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_vg_intensity: { value: 0.6, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_vg_softness: { value: 0.5, min: 0.1, max: 1, step: 0.01, label: 'Softness' },
  },
  glsl: `
    vec4 applyVignette(vec4 color, vec2 uv, float time) {
      float d = length((uv - 0.5) * vec2(aspect(), 1.0));
      float inner = mix(0.1, 0.7, u_vg_softness);
      float vig = 1.0 - smoothstep(inner, 0.95, d) * u_vg_intensity;
      return vec4(color.rgb * vig, color.a);
    }
  `,
}
