#version 300 es

precision highp float;

uniform sampler2D u_texture;

in vec2 v_uv;

out vec4 outColor;

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    float value = texture(u_texture, v_uv).r;
    vec3 color = palette(value, vec3(0.5, 0.5, 0.5),	vec3(0.5, 0.5, 0.5), vec3(2.0, 1.0, 0.0), vec3(0.50, 0.20, 0.25));
    //outColor = vec4(color, 1.);
    outColor = vec4(vec3(value), 1.) * 1.;
}
