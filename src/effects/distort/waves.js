export default {
  name: 'Waves',
  id: 'waves',
  category: 'DISTORT',
  enabled: false,
  animated: true,
  uniforms: {
    u_wv_intensity: { value: 0.03, min: 0, max: 0.1, step: 0.002, label: 'Intensity' },
    u_wv_direction: { value: 0.0, min: 0, max: 6.2831853, step: 0.05, label: 'Direction' },
    u_wv_frequency: { value: 10.0, min: 2, max: 40, step: 0.5, label: 'Frequency' },
  },
  glsl: `
    vec4 applyWaves(vec4 color, vec2 uv, float time) {
      vec2 dir = vec2(cos(u_wv_direction), sin(u_wv_direction));
      vec2 perp = vec2(-dir.y, dir.x);
      float phase = dot(uv, dir) * u_wv_frequency + time * 3.0;
      vec2 disp = perp * sin(phase) * u_wv_intensity * edgeFade(uv);
      return texture2D(u_texture, uv + disp);
    }
  `,
}
