export default {
  name: 'Motion Blur',
  id: 'motionBlur',
  category: 'BLUR',
  enabled: false,
  animated: false,
  uniforms: {
    u_mb_intensity: { value: 0.015, min: 0, max: 0.05, step: 0.001, label: 'Intensity' },
    u_mb_angle: { value: 0.0, min: 0, max: 6.2831853, step: 0.05, label: 'Angle' },
  },
  glsl: `
    vec4 applyMotionBlur(vec4 color, vec2 uv, float time) {
      vec2 dir = vec2(cos(u_mb_angle), sin(u_mb_angle)) * u_mb_intensity;
      vec3 sum = vec3(0.0);
      for (int i = 0; i < 16; i++) {
        float t = float(i) / 15.0 - 0.5;
        sum += texture2D(u_texture, uv + dir * t).rgb;
      }
      return vec4(sum / 16.0, color.a);
    }
  `,
}
