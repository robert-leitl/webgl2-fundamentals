#version 300 es

precision highp float;

uniform sampler2D u_texture;
uniform float u_diffuse;

in vec2 v_uv;

out vec4 outColor;

void main() {
    vec2 texResolution = vec2(textureSize(u_texture, 0));
    vec4 sum;
    ivec2 samplePos = ivec2(v_uv * vec2(texResolution));
    for (int o = -1; o <= 1; ++o) {
        ivec2 sampleOff = ivec2(0., o);
        sum += texelFetch(u_texture, samplePos + sampleOff, 0);
    }

    vec4 blurResult = sum / 3.0;
    vec4 orgColor = texture(u_texture, v_uv);
    outColor = mix(orgColor, blurResult, u_diffuse);
}