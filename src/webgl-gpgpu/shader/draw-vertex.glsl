#version 300 es

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

in vec3 a_position;

out float v_size;

void main() {
    vec4 worldPosition = u_worldMatrix * vec4(a_position, 1.);
    vec4 viewPosition = u_viewMatrix * worldPosition;
    gl_Position = u_projectionMatrix * viewPosition;
    float size = 1. - ((gl_Position.z / gl_Position.w) * .5 + .5);
    gl_PointSize = size * 20.;
    v_size = size;
}
