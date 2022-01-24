#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform float u_time;
uniform sampler2D u_image;

in vec3 v_color;
in vec2 v_uv;

out vec4 outColor;

void main() {
    outColor = texture(u_image, v_uv);
}
