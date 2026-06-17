export default {
  name: 'Sine Waves',
  id: 'sineWaves',
  category: 'DISTORT',
  enabled: false,
  animated: true,
  uniforms: {
    u_sw_intensity: { value: 0.03, min: 0, max: 0.1, step: 0.002, label: 'Intensity' },
    u_sw_frequency: { value: 12.0, min: 2, max: 40, step: 0.5, label: 'Frequency' },
    u_sw_speed: { value: 2.0, min: 0, max: 6, step: 0.05, label: 'Speed' },
  },
  glsl: `
    vec4 applySineWaves(vec4 color, vec2 uv, float time) {
      vec2 duv = uv;
      duv.x += sin(uv.y * u_sw_frequency + time * u_sw_speed) * u_sw_intensity;
      duv.y += cos(uv.x * u_sw_frequency * 0.7 + time * u_sw_speed * 0.8) * u_sw_intensity * 0.5;
      duv = mix(uv, duv, edgeFade(uv));
      return texture2D(u_texture, duv);
    }
  `,
}
