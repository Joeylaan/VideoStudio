export default {
  name: 'Dither',
  id: 'dither',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_di_levels: { value: 4, min: 2, max: 16, step: 1, label: 'Levels' },
    u_di_intensity: { value: 1.0, min: 0, max: 1, step: 0.01, label: 'Intensity' },
  },
  glsl: `
    // pick value at index (0..3) without dynamic array indexing (GLSL ES 1.0)
    float dither_pick4(float v0, float v1, float v2, float v3, float idx) {
      float r = v0;
      r = mix(r, v1, step(0.5, idx));
      r = mix(r, v2, step(1.5, idx));
      r = mix(r, v3, step(2.5, idx));
      return r;
    }
    float dither_bayer4(vec2 p) {
      vec2 i = floor(mod(p, 4.0));
      float row0 = dither_pick4(0.0, 8.0, 2.0, 10.0, i.x);
      float row1 = dither_pick4(12.0, 4.0, 14.0, 6.0, i.x);
      float row2 = dither_pick4(3.0, 11.0, 1.0, 9.0, i.x);
      float row3 = dither_pick4(15.0, 7.0, 13.0, 5.0, i.x);
      float v = dither_pick4(row0, row1, row2, row3, i.y);
      return (v + 0.5) / 16.0;
    }
    vec4 applyDither(vec4 color, vec2 uv, float time) {
      float threshold = dither_bayer4(uv * u_resolution);
      float levels = max(2.0, u_di_levels);
      vec3 dithered = floor(color.rgb * (levels - 1.0) + threshold) / (levels - 1.0);
      dithered = clamp(dithered, 0.0, 1.0);
      return vec4(mix(color.rgb, dithered, u_di_intensity), color.a);
    }
  `,
}
