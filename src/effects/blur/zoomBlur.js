export default {
  name: 'Zoom Blur',
  id: 'zoomBlur',
  category: 'BLUR',
  enabled: false,
  animated: false,
  uniforms: {
    u_zb_intensity: { value: 0.3, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_zb_center: { value: [0.5, 0.5], min: 0, max: 1, step: 0.01, label: 'Center', type: 'vec2' },
  },
  glsl: `
    vec4 applyZoomBlur(vec4 color, vec2 uv, float time) {
      vec2 dir = uv - u_zb_center;
      vec3 sum = vec3(0.0);
      for (int i = 0; i < 16; i++) {
        float s = 1.0 - u_zb_intensity * (float(i) / 15.0);
        sum += texture2D(u_texture, u_zb_center + dir * s).rgb;
      }
      return vec4(sum / 16.0, color.a);
    }
  `,
}
