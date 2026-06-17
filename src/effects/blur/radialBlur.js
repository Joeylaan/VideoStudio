export default {
  name: 'Radial Blur',
  id: 'radialBlur',
  category: 'BLUR',
  enabled: false,
  animated: false,
  uniforms: {
    u_rb_intensity: { value: 0.03, min: 0, max: 0.12, step: 0.002, label: 'Intensity' },
    u_rb_center: { value: [0.5, 0.5], min: 0, max: 1, step: 0.01, label: 'Center', type: 'vec2' },
  },
  glsl: `
    vec4 applyRadialBlur(vec4 color, vec2 uv, float time) {
      vec2 c = uv - u_rb_center;
      vec3 sum = vec3(0.0);
      for (int i = 0; i < 16; i++) {
        float a = (float(i) / 15.0 - 0.5) * u_rb_intensity;
        sum += texture2D(u_texture, u_rb_center + rot2(c, a)).rgb;
      }
      return vec4(sum / 16.0, color.a);
    }
  `,
}
