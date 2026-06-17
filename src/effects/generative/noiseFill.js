export default {
  name: 'Noise Fill',
  id: 'noiseFill',
  category: 'GENERATIVE',
  enabled: false,
  animated: true,
  uniforms: {
    u_nf_intensity: { value: 0.4, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_nf_scale: { value: 12.0, min: 1, max: 40, step: 0.5, label: 'Scale' },
    u_nf_speed: { value: 1.0, min: 0, max: 4, step: 0.05, label: 'Speed' },
  },
  glsl: `
    vec4 applyNoiseFill(vec4 color, vec2 uv, float time) {
      float t = time * u_nf_speed;
      float r = vnoise(uv * u_nf_scale + vec2(t, 0.0));
      float g = vnoise(uv * u_nf_scale + vec2(0.0, t) + 11.0);
      float b = vnoise(uv * u_nf_scale - t + 23.0);
      vec3 n = vec3(r, g, b);
      return vec4(mix(color.rgb, n, u_nf_intensity), color.a);
    }
  `,
}
