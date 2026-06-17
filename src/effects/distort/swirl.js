export default {
  name: 'Swirl',
  id: 'swirl',
  category: 'DISTORT',
  enabled: false,
  animated: false,
  uniforms: {
    u_sl_intensity: { value: 2.5, min: -6, max: 6, step: 0.1, label: 'Strength' },
    u_sl_radius: { value: 0.5, min: 0.1, max: 1, step: 0.01, label: 'Radius' },
  },
  glsl: `
    vec4 applySwirl(vec4 color, vec2 uv, float time) {
      vec2 c = uv - 0.5;
      c.x *= aspect();
      float d = length(c);
      float amt = smoothstep(u_sl_radius, 0.0, d) * u_sl_intensity;
      c = rot2(c, amt);
      c.x /= aspect();
      vec2 duv = mix(uv, c + 0.5, edgeFade(uv));
      return texture2D(u_texture, duv);
    }
  `,
}
