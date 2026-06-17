export default {
  name: 'Liquify',
  id: 'liquify',
  category: 'DISTORT',
  enabled: false,
  animated: true,
  uniforms: {
    u_lq_intensity: { value: 0.05, min: 0, max: 0.15, step: 0.002, label: 'Intensity' },
    u_lq_speed: { value: 0.5, min: 0, max: 2, step: 0.01, label: 'Speed' },
  },
  glsl: `
    vec4 applyLiquify(vec4 color, vec2 uv, float time) {
      float t = time * u_lq_speed;
      vec2 q = vec2(fbm(uv * 3.0 + t), fbm(uv * 3.0 + vec2(3.1, 1.7) - t));
      vec2 r = vec2(
        fbm(uv * 3.0 + q * 2.0 + t * 0.5),
        fbm(uv * 3.0 + q * 2.0 + vec2(8.3, 2.8))
      );
      vec2 disp = (r - 0.5) * u_lq_intensity * edgeFade(uv);
      return texture2D(u_texture, uv + disp);
    }
  `,
}
