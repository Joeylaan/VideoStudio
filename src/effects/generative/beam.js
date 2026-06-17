export default {
  name: 'Beam',
  id: 'beam',
  category: 'GENERATIVE',
  enabled: false,
  animated: true,
  uniforms: {
    u_bm_intensity: { value: 0.6, min: 0, max: 1.5, step: 0.01, label: 'Intensity' },
    u_bm_speed: { value: 0.6, min: 0, max: 2, step: 0.02, label: 'Speed' },
    u_bm_width: { value: 0.15, min: 0.02, max: 0.5, step: 0.01, label: 'Width' },
  },
  glsl: `
    vec4 applyBeam(vec4 color, vec2 uv, float time) {
      float pos = fract(time * u_bm_speed * 0.2) * 1.4 - 0.2;
      float dist = abs((uv.x - pos) + (uv.y - 0.5) * 0.3);
      float beam = smoothstep(u_bm_width, 0.0, dist);
      vec3 col = vec3(1.0, 0.97, 0.9);
      return vec4(color.rgb + col * beam * u_bm_intensity, color.a);
    }
  `,
}
