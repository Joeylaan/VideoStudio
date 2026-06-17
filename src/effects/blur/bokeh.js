export default {
  name: 'Bokeh',
  id: 'bokeh',
  category: 'BLUR',
  enabled: false,
  animated: false,
  uniforms: {
    u_bk_radius: { value: 0.01, min: 0, max: 0.03, step: 0.0005, label: 'Radius' },
    u_bk_shape: { value: 6, min: 3, max: 8, step: 1, label: 'Aperture Sides' },
  },
  glsl: `
    vec4 applyBokeh(vec4 color, vec2 uv, float time) {
      vec3 sum = vec3(0.0);
      float n = 0.0;
      float sides = max(3.0, u_bk_shape);
      for (int i = 0; i < 32; i++) {
        float fi = float(i);
        float a = fi / 32.0 * 6.2831853;
        // polygonal aperture radius modulation
        float poly = cos(3.14159 / sides) / cos(mod(a, 6.2831853 / sides) - 3.14159 / sides);
        float jitter = 0.5 + 0.5 * fract(sin(fi * 12.9898) * 43758.5453);
        float rr = u_bk_radius * poly * jitter;
        vec2 o = vec2(cos(a), sin(a)) * rr;
        o.y *= aspect();
        sum += texture2D(u_texture, uv + o).rgb;
        n += 1.0;
      }
      return vec4(sum / n, color.a);
    }
  `,
}
