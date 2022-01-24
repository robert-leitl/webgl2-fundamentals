#version 300 es

in vec4 a_position;
in vec3 a_color;
in vec2 a_uv;

uniform mat4 u_matrix;

out vec3 v_color;
out vec2 v_uv;

void main() {
    v_color = a_color;
    v_uv = a_uv;
    gl_Position = u_matrix * a_position;
}
