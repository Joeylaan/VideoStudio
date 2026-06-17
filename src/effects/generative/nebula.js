export default {
  name: 'Nebula',
  id: 'nebula',
  category: 'GENERATIVE',
  enabled: false,
  animated: true,
  uniforms: {
    u_nb_intensity: { value: 0.6, min: 0, max: 1.5, step: 0.01, label: 'Intensity' },
    u_nb_speed: { value: 0.4, min: 0, max: 2, step: 0.02, label: 'Speed' },
    u_nb_colorA: { value: [0.5, 0.1, 0.8], min: 0, max: 1, step: 0.01, label: 'Color A', type: 'vec3', color: true },
    u_nb_colorB: { value: [0.1, 0.3, 0.9], min: 0, max: 1, step: 0.01, label: 'Color B', type: 'vec3', color: true },
  },
  glsl: `
    vec4 applyNebula(vec4 color, vec2 uv, float time) {
      float t = time * u_nb_speed;
      vec2 p = uv * 3.0;
      float n1 = fbm(p + vec2(t, 0.0));
      float n2 = fbm(p * 1.7 - vec2(0.0, t * 0.7) + n1);
      float d = smoothstep(0.3, 1.0, n2);
      vec3 neb = mix(u_nb_colorA, u_nb_colorB, n1) * d;
      return vec4(color.rgb + neb * u_nb_intensity, color.a);
    }
  `,
}
