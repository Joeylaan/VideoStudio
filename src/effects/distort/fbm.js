export default {
  name: 'FBM',
  id: 'fbm',
  category: 'DISTORT',
  enabled: false,
  animated: true,
  uniforms: {
    u_fbm_intensity: { value: 0.04, min: 0, max: 0.2, step: 0.005, label: 'Intensity' },
    u_fbm_speed: { value: 0.3, min: 0, max: 2, step: 0.01, label: 'Speed' },
    u_fbm_scale: { value: 3.0, min: 0.5, max: 8, step: 0.1, label: 'Scale' },
    u_fbm_octaves: { value: 5, min: 1, max: 8, step: 1, label: 'Octaves' },
  },
  glsl: `
    float fbm_sum(vec2 p, float oct) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 8; i++) {
        if (float(i) >= oct) break;
        v += a * vnoise(p);
        p *= 2.0; a *= 0.5;
      }
      return v;
    }
    vec4 applyFbm(vec4 color, vec2 uv, float time) {
      vec2 p = uv * u_fbm_scale + time * u_fbm_speed;
      float nx = fbm_sum(p, u_fbm_octaves);
      float ny = fbm_sum(p + vec2(5.2, 1.3), u_fbm_octaves);
      vec2 disp = (vec2(nx, ny) - 0.5) * u_fbm_intensity * edgeFade(uv);
      return texture2D(u_texture, uv + disp);
    }
  `,
}
