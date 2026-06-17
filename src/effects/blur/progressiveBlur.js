export default {
  name: 'Progressive Blur',
  id: 'progressiveBlur',
  category: 'BLUR',
  enabled: false,
  animated: false,
  uniforms: {
    u_pb_intensity: { value: 3.0, min: 0, max: 8, step: 0.1, label: 'Intensity' },
    u_pb_direction: { value: 0, min: 0, max: 2, step: 1, label: 'Direction (btm/top/edge)' },
  },
  glsl: `
    vec4 applyProgressiveBlur(vec4 color, vec2 uv, float time) {
      float mask;
      if (u_pb_direction < 0.5) mask = 1.0 - uv.y;        // bottom-heavy
      else if (u_pb_direction < 1.5) mask = uv.y;         // top-heavy
      else mask = clamp(length(uv - 0.5) * 1.6, 0.0, 1.0); // edges
      mask = clamp(mask, 0.0, 1.0);
      vec2 px = (mask * u_pb_intensity) / u_resolution;
      vec3 sum = vec3(0.0);
      float wsum = 0.0;
      for (int i = -3; i <= 3; i++) {
        for (int j = -3; j <= 3; j++) {
          float w = exp(-float(i * i + j * j) / 4.5);
          sum += texture2D(u_texture, uv + vec2(float(i), float(j)) * px).rgb * w;
          wsum += w;
        }
      }
      return vec4(sum / wsum, color.a);
    }
  `,
}
