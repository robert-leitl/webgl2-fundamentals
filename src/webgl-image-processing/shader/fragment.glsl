#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec4 u_color;
uniform sampler2D u_image;
uniform float u_time;

out vec4 outColor;

in vec2 v_uv;

void main() {
    vec2 onePixel = vec2(1.) / vec2(textureSize(u_image, 0));

    vec4 color = texture(u_image, v_uv);

    float oldPixel = color.b;
    float newPixel = round(color.b);

    outColor = vec4(vec3(newPixel), 1.);
}
