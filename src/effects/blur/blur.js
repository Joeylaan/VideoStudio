export default {
  name: 'Blur',
  id: 'blur',
  category: 'BLUR',
  enabled: false,
  animated: false,
  uniforms: {
    u_blur_radius: { value: 2.0, min: 0, max: 8, step: 0.1, label: 'Radius' },
  },
  glsl: `
    vec4 applyBlur(vec4 color, vec2 uv, float time) {
      vec2 px = u_blur_radius / u_resolution;
      vec3 sum = vec3(0.0);
      float wsum = 0.0;
      for (int i = -4; i <= 4; i++) {
        for (int j = -4; j <= 4; j++) {
          float w = exp(-float(i * i + j * j) / 8.0);
          sum += texture2D(u_texture, uv + vec2(float(i), float(j)) * px).rgb * w;
          wsum += w;
        }
      }
      return vec4(sum / wsum, color.a);
    }
  `,
}
