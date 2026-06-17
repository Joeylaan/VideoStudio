export default {
  name: 'Pixelate',
  id: 'pixelate',
  category: 'DISTORT',
  enabled: false,
  animated: false,
  uniforms: {
    u_px_size: { value: 40.0, min: 2, max: 200, step: 1, label: 'Blocks' },
  },
  glsl: `
    vec4 applyPixelate(vec4 color, vec2 uv, float time) {
      float blocks = max(2.0, u_px_size);
      vec2 grid = vec2(blocks, blocks / aspect());
      vec2 duv = (floor(uv * grid) + 0.5) / grid;
      return texture2D(u_texture, duv);
    }
  `,
}
