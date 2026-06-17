export default {
  name: 'Bloom',
  id: 'bloom',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_bl_intensity: { value: 0.8, min: 0, max: 2, step: 0.02, label: 'Intensity' },
    u_bl_threshold: { value: 0.6, min: 0, max: 1, step: 0.01, label: 'Threshold' },
    u_bl_radius: { value: 3.0, min: 1, max: 8, step: 0.1, label: 'Radius' },
  },
  glsl: `
    vec4 applyBloom(vec4 color, vec2 uv, float time) {
      vec2 px = u_bl_radius / u_resolution;
      vec3 sum = vec3(0.0);
      float wsum = 0.0;
      for (int i = -3; i <= 3; i++) {
        for (int j = -3; j <= 3; j++) {
          vec2 o = vec2(float(i), float(j)) * px;
          float w = exp(-float(i * i + j * j) / 8.0);
          vec3 s = texture2D(u_texture, uv + o).rgb;
          float b = max(0.0, luma(s) - u_bl_threshold);
          sum += s * b * w;
          wsum += w;
        }
      }
      sum /= max(wsum, 1e-4);
      return vec4(color.rgb + sum * u_bl_intensity, color.a);
    }
  `,
}
