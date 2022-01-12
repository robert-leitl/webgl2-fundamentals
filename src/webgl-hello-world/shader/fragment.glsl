#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec4 u_color;
uniform float u_time;

out vec4 outColor;

void main() {
    float f = (sin(u_time * 12.) * 0.5 + 1.) * 0.5;
    vec4 color = vec4(u_color.rgb * f, 1.);

    outColor = color;
}
