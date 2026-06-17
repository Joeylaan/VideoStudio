// =====================================================================
//  COMPOSER FRAGMENT SHADER (template)
//  useWebGL.js builds the final shader at runtime by replacing the three
//  tokens below with the active effects' uniform declarations, GLSL
//  functions, and the chained calls.
//
//  Effect contract:
//    - Every effect exposes ONE function: vec4 apply<Id>(vec4 color, vec2 uv, float time)
//      where <Id> is the effect id with its first letter capitalised.
//    - Effects read their own uniforms as globals (declared via __UNIFORMS__).
//    - Effects may use the shared prelude helpers below. They must NOT
//      redefine them. Custom helpers must be prefixed with the effect id.
//    - Available globals: u_texture, u_resolution, u_time, v_uv.
// =====================================================================
precision highp float;

varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_resolution;   // texture/canvas size in pixels
uniform float u_time;        // seconds since start

// --------------------------- shared prelude ---------------------------
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * vnoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec2 rot2(vec2 v, float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c) * v;
}

float luma(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float aspect() {
  return u_resolution.x / max(u_resolution.y, 1.0);
}

// Distortion border guard: 0 exactly at the canvas edge → 1 just inside.
// Multiply UV displacement (or mix the distorted UV) by this so distortions
// never pull the image off the border — the frame always stays filled.
float edgeFade(vec2 uv) {
  vec2 f = smoothstep(vec2(0.0), vec2(0.12), uv) * smoothstep(vec2(0.0), vec2(0.12), 1.0 - uv);
  return f.x * f.y;
}
// ------------------------- end shared prelude -------------------------

/* __UNIFORMS__ */

/* __FUNCTIONS__ */

void main() {
  vec2 uv = v_uv;
  vec4 color = texture2D(u_texture, uv);
/* __CHAIN__ */
  gl_FragColor = vec4(color.rgb, 1.0);
}
