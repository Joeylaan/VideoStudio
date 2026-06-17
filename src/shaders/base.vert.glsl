// Fullscreen-quad vertex shader.
// a_position spans the clip-space quad (-1..1); v_uv maps it to 0..1 texture space.
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
