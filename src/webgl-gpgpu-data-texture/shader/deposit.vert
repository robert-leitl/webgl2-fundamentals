#version 300 es

uniform ivec2 u_resolution;

in vec2 a_position;

void main() {
    vec4 pos = vec4(a_position, 0., 1.) / vec4(u_resolution, 1., 1.);
    pos = pos * 2. - 1.;
    gl_Position = pos;
    gl_PointSize = 1.;
}
