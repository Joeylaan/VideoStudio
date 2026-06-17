export default {
  name: 'Noise',
  id: 'noise',
  category: 'DISTORT',
  enabled: false,
  animated: true,
  uniforms: {
    u_ns_intensity: { value: 0.03, min: 0, max: 0.1, step: 0.002, label: 'Intensity' },
    u_ns_scale: { value: 6.0, min: 1, max: 20, step: 0.5, label: 'Scale' },
    u_ns_speed: { value: 0.8, min: 0, max: 3, step: 0.02, label: 'Speed' },
  },
  glsl: `
    vec4 applyNoise(vec4 color, vec2 uv, float time) {
      float t = time * u_ns_speed;
      vec2 disp = vec2(
        vnoise(uv * u_ns_scale + t) - 0.5,
        vnoise(uv * u_ns_scale + vec2(13.5, 7.2) - t) - 0.5
      ) * u_ns_intensity * edgeFade(uv);
      return texture2D(u_texture, uv + disp);
    }
  `,
}
