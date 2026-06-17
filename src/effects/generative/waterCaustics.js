export default {
  name: 'Water Caustics',
  id: 'waterCaustics',
  category: 'GENERATIVE',
  enabled: false,
  animated: true,
  uniforms: {
    u_wc_intensity: { value: 0.5, min: 0, max: 1.5, step: 0.01, label: 'Intensity' },
    u_wc_speed: { value: 0.5, min: 0, max: 2, step: 0.02, label: 'Speed' },
    u_wc_scale: { value: 6.0, min: 1, max: 20, step: 0.5, label: 'Scale' },
  },
  glsl: `
    vec4 applyWaterCaustics(vec4 color, vec2 uv, float time) {
      vec2 p = uv * u_wc_scale;
      float t = time * u_wc_speed;
      float c = 0.0;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        vec2 q = p + vec2(sin(t + fi), cos(t * 0.8 + fi)) * 1.5;
        c += sin(q.x + t) + sin(q.y - t) + sin((q.x + q.y) * 0.7 + t);
      }
      c /= 3.0;
      float caustic = pow(max(0.0, c * 0.5 + 0.5), 3.0);
      vec3 col = vec3(0.6, 0.85, 1.0) * caustic;
      return vec4(color.rgb + col * u_wc_intensity, color.a);
    }
  `,
}
