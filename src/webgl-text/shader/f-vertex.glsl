#version 300 es

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

in vec4 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
    v_color = a_color;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * a_position;
}
