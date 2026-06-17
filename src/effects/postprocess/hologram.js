export default {
  name: 'Hologram',
  id: 'hologram',
  category: 'POST PROCESS',
  enabled: false,
  animated: true,
  uniforms: {
    u_hg_intensity: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_hg_speed: { value: 1.0, min: 0, max: 4, step: 0.05, label: 'Speed' },
  },
  glsl: `
    vec4 applyHologram(vec4 color, vec2 uv, float time) {
      float l = luma(color.rgb);
      float fringe = sin(uv.y * 40.0 + uv.x * 10.0 + time * u_hg_speed * 4.0);
      float hue = fract(l * 0.8 + uv.y * 0.5 + time * u_hg_speed * 0.1 + fringe * 0.05);
      vec3 iridescent = hsv2rgb(vec3(hue, 0.7, 1.0));
      float scan = 0.85 + 0.15 * sin(uv.y * u_resolution.y * 0.7);
      vec3 holo = mix(color.rgb, iridescent * scan, u_hg_intensity);
      return vec4(holo, color.a);
    }
  `,
}
