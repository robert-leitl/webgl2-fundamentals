#version 300 es

precision highp float;

out vec4 outColor;

in float v_size;

void main() {
    vec2 c = gl_PointCoord * 2. - 1.;
    float mask = 1. - smoothstep(0.7, 0.9, length(c));
    outColor = vec4(vec3(v_size) * mask, mask);
}
