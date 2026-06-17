export default {
  name: 'Nineties VHS',
  id: 'ninetiesVhs',
  category: 'POST PROCESS',
  enabled: false,
  animated: true,
  uniforms: {
    u_vhs_intensity: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_vhs_scanlines: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Scanlines' },
    u_vhs_bleed: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Color Bleed' },
  },
  glsl: `
    vec4 applyNinetiesVhs(vec4 color, vec2 uv, float time) {
      float bleed = u_vhs_bleed * 0.01;
      float r = texture2D(u_texture, uv + vec2(bleed, 0.0)).r;
      float g = color.g;
      float b = texture2D(u_texture, uv - vec2(bleed, 0.0)).b;
      vec3 col = mix(color.rgb, vec3(r, g, b), u_vhs_intensity);
      float line = hash21(vec2(floor(uv.y * u_resolution.y * 0.5), floor(time * 15.0)));
      col += (line - 0.5) * 0.15 * u_vhs_intensity;
      float sl = 0.9 + 0.1 * sin(uv.y * u_resolution.y * 1.5);
      col *= mix(1.0, sl, u_vhs_scanlines);
      return vec4(col, color.a);
    }
  `,
}
