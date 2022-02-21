#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform float u_decay;

in vec2 v_uv;

out vec4 outColor;

void main() {
    outColor = texture(u_texture, v_uv) * u_decay;
}