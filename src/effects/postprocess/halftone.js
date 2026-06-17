export default {
  name: 'Halftone',
  id: 'halftone',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_ht_size: { value: 6.0, min: 2, max: 20, step: 0.5, label: 'Size' },
    u_ht_angle: { value: 0.5, min: 0, max: 6.2831853, step: 0.05, label: 'Angle' },
    u_ht_intensity: { value: 1.0, min: 0, max: 1, step: 0.01, label: 'Intensity' },
  },
  glsl: `
    vec4 applyHalftone(vec4 color, vec2 uv, float time) {
      float l = luma(color.rgb);
      vec2 p = (uv * u_resolution) / max(2.0, u_ht_size);
      p = rot2(p, u_ht_angle);
      vec2 cell = fract(p) - 0.5;
      float d = length(cell) * 2.0;
      float radius = sqrt(1.0 - l);
      float ink = 1.0 - smoothstep(radius - 0.2, radius, d);
      vec3 ht = mix(vec3(1.0), color.rgb, ink);
      return vec4(mix(color.rgb, ht, u_ht_intensity), color.a);
    }
  `,
}
