export default {
  name: 'Chromatic Aberration',
  id: 'chromaticAberration',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_ca_intensity: { value: 0.008, min: 0, max: 0.05, step: 0.001, label: 'Intensity' },
    u_ca_angle: { value: 0.0, min: 0, max: 6.2831853, step: 0.05, label: 'Angle' },
  },
  glsl: `
    vec4 applyChromaticAberration(vec4 color, vec2 uv, float time) {
      vec2 dir = vec2(cos(u_ca_angle), sin(u_ca_angle));
      vec2 off = (dir + (uv - 0.5)) * u_ca_intensity;
      float r = texture2D(u_texture, uv + off).r;
      float g = color.g;
      float b = texture2D(u_texture, uv - off).b;
      return vec4(r, g, b, color.a);
    }
  `,
}
