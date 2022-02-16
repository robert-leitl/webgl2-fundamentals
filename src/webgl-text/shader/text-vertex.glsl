#version 300 es

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

in vec4 a_position;
in vec2 a_texcoord;

out vec2 v_uv;

void main() {
    v_uv = a_texcoord;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * a_position;
}
