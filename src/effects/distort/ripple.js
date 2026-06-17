export default {
  name: 'Ripple',
  id: 'ripple',
  category: 'DISTORT',
  enabled: false,
  animated: true,
  uniforms: {
    u_rp_intensity: { value: 0.03, min: 0, max: 0.1, step: 0.002, label: 'Intensity' },
    u_rp_frequency: { value: 25.0, min: 5, max: 60, step: 1, label: 'Frequency' },
    u_rp_speed: { value: 2.0, min: 0, max: 6, step: 0.05, label: 'Speed' },
  },
  glsl: `
    vec4 applyRipple(vec4 color, vec2 uv, float time) {
      vec2 c = uv - 0.5;
      c.x *= aspect();
      float d = length(c);
      float wave = sin(d * u_rp_frequency - time * u_rp_speed) * exp(-d * 2.0);
      vec2 disp = normalize(c + 1e-5) * wave * u_rp_intensity * edgeFade(uv);
      return texture2D(u_texture, uv + disp);
    }
  `,
}
