export default {
  name: 'Adjust',
  id: 'adjust',
  category: 'POST PROCESS',
  enabled: false,
  animated: false,
  uniforms: {
    u_aj_brightness: { value: 0.0, min: -1, max: 1, step: 0.01, label: 'Brightness' },
    u_aj_contrast: { value: 1.0, min: 0, max: 2, step: 0.01, label: 'Contrast' },
    u_aj_saturation: { value: 1.0, min: 0, max: 2, step: 0.01, label: 'Saturation' },
    u_aj_hue: { value: 0.0, min: 0, max: 6.2831853, step: 0.05, label: 'Hue' },
  },
  glsl: `
    vec4 applyAdjust(vec4 color, vec2 uv, float time) {
      vec3 c = color.rgb;
      c += u_aj_brightness;
      c = (c - 0.5) * u_aj_contrast + 0.5;
      vec3 hsv = rgb2hsv(clamp(c, 0.0, 1.0));
      hsv.x = fract(hsv.x + u_aj_hue / 6.2831853);
      hsv.y = clamp(hsv.y * u_aj_saturation, 0.0, 1.0);
      c = hsv2rgb(hsv);
      return vec4(clamp(c, 0.0, 1.0), color.a);
    }
  `,
}
