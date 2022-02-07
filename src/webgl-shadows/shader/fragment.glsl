#version 300 es
precision highp float;
 
in vec4 v_position;
in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_surfaceToLight;
in vec3 v_surfaceToView;
in vec4 v_projectedLightCoord;
 
uniform vec4 u_lightColor;
uniform vec4 u_ambient;
uniform sampler2D u_diffuse;
uniform sampler2D u_projectedTexture;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;
uniform vec4 u_colorMult;
uniform bool u_recieveShadow;
 
out vec4 outColor;
 
vec4 lit(float l ,float h, float m) {
  return vec4(1.0,
              max(l, 0.0),
              (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
              1.0);
}
 
void main() {
    // divide by w to get the correct value
    vec3 projectedLightCoord = v_projectedLightCoord.xyz / v_projectedLightCoord.w;
    projectedLightCoord = projectedLightCoord * 0.5 + 0.5;
    float currentDepth = projectedLightCoord.z - 0.005;
    
    bool inRange = 
        projectedLightCoord.x >= 0.0 &&
        projectedLightCoord.x <= 1.0 &&
        projectedLightCoord.y >= 0.0 &&
        projectedLightCoord.y <= 1.0;
    float projectedAmount = inRange ? 1.0 : 0.0;
    float projectedDepth = texture(u_projectedTexture, projectedLightCoord.xy).r;
    float shadowLight = (!u_recieveShadow || currentDepth <= projectedDepth) ? 1.0 : 0.;


    vec4 diffuseColor = texture(u_diffuse, v_texCoord) * u_colorMult;
    vec3 a_normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToView = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLight + surfaceToView);
    vec4 litR = lit(dot(a_normal, surfaceToLight), dot(a_normal, halfVector), u_shininess);
    outColor = vec4((u_lightColor * (diffuseColor * litR.y * shadowLight + diffuseColor * u_ambient + u_specular * litR.z * u_specularFactor * shadowLight)).rgb, diffuseColor.a);
}