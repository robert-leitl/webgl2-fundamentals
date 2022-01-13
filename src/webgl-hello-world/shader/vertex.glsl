#version 300 es

in vec4 a_position;
in vec3 a_vertexColor;

out vec4 v_color;

void main() {
    v_color = vec4(a_vertexColor, 1.);
    gl_Position = a_position;
}
