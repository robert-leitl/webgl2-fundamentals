#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec4 u_color;
uniform float u_time;

out vec4 outColor;

in vec4 v_color;

void main() {
    float s = 0.5;
    float f = (sin(u_time * 5.) * 0.5 + 1.) * s + (1. - s);
    vec4 color = vec4(v_color.rgb * f, 1.);

    outColor = color;
}
