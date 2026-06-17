export default {
  name: 'Water Ripple',
  id: 'waterRipple',
  category: 'DISTORT',
  enabled: false,
  animated: true,
  uniforms: {
    u_wr_intensity: { value: 0.02, min: 0, max: 0.1, step: 0.002, label: 'Intensity' },
    u_wr_speed: { value: 1.5, min: 0, max: 4, step: 0.05, label: 'Speed' },
    u_wr_frequency: { value: 30.0, min: 5, max: 80, step: 1, label: 'Frequency' },
  },
  glsl: `
    vec4 applyWaterRipple(vec4 color, vec2 uv, float time) {
      vec2 c = uv - 0.5;
      c.x *= aspect();
      float d = length(c);
      float w = sin(d * u_wr_frequency - time * u_wr_speed);
      vec2 dir = c / (d + 1e-4);
      vec2 disp = dir * w * u_wr_intensity * edgeFade(uv);
      return texture2D(u_texture, uv + disp);
    }
  `,
}
