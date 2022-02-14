#version 300 es
precision highp float;

in vec4 v_position;
 
uniform mat4 u_viewProjectionInverse;
uniform samplerCube u_cubeMap;
 
out vec4 outColor;

void main() {
    vec4 d = u_viewProjectionInverse * v_position;
    outColor = texture(u_cubeMap, normalize(d.xyz / d.w));
}