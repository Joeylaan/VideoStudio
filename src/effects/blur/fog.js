export default {
  name: 'Fog',
  id: 'fog',
  category: 'BLUR',
  enabled: false,
  animated: true,
  uniforms: {
    u_fog_intensity: { value: 0.5, min: 0, max: 1, step: 0.01, label: 'Intensity' },
    u_fog_speed: { value: 0.4, min: 0, max: 2, step: 0.02, label: 'Speed' },
    u_fog_density: { value: 1.0, min: 0, max: 2, step: 0.02, label: 'Density' },
  },
  glsl: `
    vec4 applyFog(vec4 color, vec2 uv, float time) {
      float t = time * u_fog_speed;
      float n = fbm(uv * 3.0 * u_fog_density + vec2(t, t * 0.5));
      n = smoothstep(0.2, 0.9, n);
      vec3 fogc = vec3(0.8, 0.82, 0.85);
      return vec4(mix(color.rgb, fogc, n * u_fog_intensity), color.a);
    }
  `,
}
