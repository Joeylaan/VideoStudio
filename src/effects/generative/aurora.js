export default {
  name: 'Aurora',
  id: 'aurora',
  category: 'GENERATIVE',
  enabled: false,
  animated: true,
  uniforms: {
    u_au_intensity: { value: 0.6, min: 0, max: 1.5, step: 0.01, label: 'Intensity' },
    u_au_speed: { value: 0.5, min: 0, max: 2, step: 0.02, label: 'Speed' },
    u_au_colorShift: { value: 0.0, min: 0, max: 6.2831853, step: 0.05, label: 'Color Shift' },
  },
  glsl: `
    vec4 applyAurora(vec4 color, vec2 uv, float time) {
      float t = time * u_au_speed;
      float band = fbm(vec2(uv.x * 3.0, uv.y * 2.0 - t));
      float curtain = smoothstep(0.0, 0.6, sin((uv.x * 3.0 + band * 2.0) * 1.5 + t));
      float falloff = smoothstep(0.0, 1.0, 1.0 - abs(uv.y - 0.6) * 1.6);
      float intensity = curtain * falloff;
      vec3 col = hsv2rgb(vec3(fract(0.35 + band * 0.2 + u_au_colorShift / 6.2831853), 0.7, 1.0));
      return vec4(color.rgb + col * intensity * u_au_intensity, color.a);
    }
  `,
}
