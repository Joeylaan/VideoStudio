export default {
  name: 'Lens Distort',
  id: 'lensDistort',
  category: 'DISTORT',
  enabled: false,
  animated: false,
  uniforms: {
    u_ld_intensity: { value: 0.4, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_ld_type: { value: 0, min: 0, max: 1, step: 1, label: 'Type (barrel/pin)' },
  },
  glsl: `
    vec4 applyLensDistort(vec4 color, vec2 uv, float time) {
      vec2 c = uv - 0.5;
      float r2 = dot(c, c);
      float k = u_ld_intensity * mix(1.0, -1.0, u_ld_type);
      vec2 duv = c * (1.0 + k * r2) + 0.5;
      duv = mix(uv, duv, edgeFade(uv));
      return texture2D(u_texture, duv);
    }
  `,
}
