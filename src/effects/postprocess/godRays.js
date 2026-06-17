export default {
  name: 'God Rays',
  id: 'godRays',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_god_intensity: { value: 0.5, min: 0, max: 1.5, step: 0.01, label: 'Intensity' },
    u_god_origin: { value: [0.5, 0.7], min: 0, max: 1, step: 0.01, label: 'Origin', type: 'vec2' },
    u_god_decay: { value: 0.95, min: 0.8, max: 1, step: 0.005, label: 'Decay' },
  },
  glsl: `
    vec4 applyGodRays(vec4 color, vec2 uv, float time) {
      vec2 delta = (uv - u_god_origin) / 32.0 * 0.6;
      vec2 pos = uv;
      float decay = 1.0;
      vec3 sum = vec3(0.0);
      for (int i = 0; i < 32; i++) {
        pos -= delta;
        vec3 s = texture2D(u_texture, pos).rgb;
        float b = max(0.0, luma(s) - 0.5);
        sum += s * b * decay;
        decay *= u_god_decay;
      }
      sum /= 32.0;
      return vec4(color.rgb + sum * u_god_intensity * 2.5, color.a);
    }
  `,
}
