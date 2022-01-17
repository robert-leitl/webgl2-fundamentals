#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

uniform vec4 u_color;
uniform sampler2D u_image;
uniform float u_time;
uniform float[9] u_kernel;
uniform float u_kernelWeight;

out vec4 outColor;

in vec2 v_uv;

void main() {
    vec2 onePixel = vec2(1.) / vec2(textureSize(u_image, 0));

    vec4 color = texture(u_image, v_uv);

    vec4 colorSum =
        texture(u_image, v_uv + onePixel * vec2(-1, -1)) * u_kernel[0] +
        texture(u_image, v_uv + onePixel * vec2( 0, -1)) * u_kernel[1] +
        texture(u_image, v_uv + onePixel * vec2( 1, -1)) * u_kernel[2] +
        texture(u_image, v_uv + onePixel * vec2(-1,  0)) * u_kernel[3] +
        texture(u_image, v_uv + onePixel * vec2( 0,  0)) * u_kernel[4] +
        texture(u_image, v_uv + onePixel * vec2( 1,  0)) * u_kernel[5] +
        texture(u_image, v_uv + onePixel * vec2(-1,  1)) * u_kernel[6] +
        texture(u_image, v_uv + onePixel * vec2( 0,  1)) * u_kernel[7] +
        texture(u_image, v_uv + onePixel * vec2( 1,  1)) * u_kernel[8] ;
    outColor = vec4((colorSum / u_kernelWeight).rgb, 1);
}
