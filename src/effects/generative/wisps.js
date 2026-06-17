export default {
  name: 'Wisps',
  id: 'wisps',
  category: 'GENERATIVE',
  enabled: false,
  animated: true,
  uniforms: {
    u_ws_intensity: { value: 0.6, min: 0, max: 1.5, step: 0.01, label: 'Intensity' },
    u_ws_speed: { value: 0.6, min: 0, max: 2, step: 0.02, label: 'Speed' },
    u_ws_count: { value: 6, min: 1, max: 12, step: 1, label: 'Count' },
  },
  glsl: `
    vec4 applyWisps(vec4 color, vec2 uv, float time) {
      vec2 p = uv;
      p.x *= aspect();
      vec3 acc = vec3(0.0);
      for (int i = 0; i < 12; i++) {
        if (float(i) >= u_ws_count) break;
        float fi = float(i);
        float t = time * u_ws_speed + fi * 1.7;
        vec2 c = vec2(
          (hash21(vec2(fi, 1.0)) * 1.2 - 0.1) * aspect() + sin(t * 0.7 + fi) * 0.15,
          fract(hash21(vec2(fi, 2.0)) + t * 0.05)
        );
        float d = length(p - c);
        float glow = 0.006 / (d * d + 0.0008);
        vec3 col = hsv2rgb(vec3(fract(0.6 + fi * 0.1), 0.5, 1.0));
        acc += col * glow;
      }
      return vec4(color.rgb + acc * u_ws_intensity, color.a);
    }
  `,
}
