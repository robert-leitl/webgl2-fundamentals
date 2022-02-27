#version 300 es

uniform float u_deltaTime;
uniform ivec2 u_resolution;
uniform sampler2D u_dataTexture;
uniform float u_randomStrength;
uniform float u_sensorDist;
uniform float u_sensorAngle;
uniform float u_velocity;
uniform float u_steeringStrength;
uniform float u_sensorSize;

in vec2 a_oldPosition;
in float a_oldAngle;

out vec2 t_newPosition;
out float t_newAngle;

const float PI = 3.14159265359;

float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }

float noise(vec2 x) {
	vec2 i = floor(x);
	vec2 f = fract(x);
	float a = hash(i);
	float b = hash(i + vec2(1.0, 0.0));
	float c = hash(i + vec2(0.0, 1.0));
	float d = hash(i + vec2(1.0, 1.0));
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float getSensorData(vec2 origin, float angle, float dist, float sensorSize) {
    vec2 off = vec2(cos(angle), sin(angle)) * dist;
    vec2 size = vec2(textureSize(u_dataTexture, 0));
    vec2 sensorUV = (origin + off) / size;
    vec4 s = textureLod(u_dataTexture, sensorUV, sensorSize);
    return s.r;
}

void main() {
    vec2 pos = a_oldPosition;
    float angle = a_oldAngle;
    float velocity = u_velocity;

    // get random value between -1 and 1
    float n = noise(pos * u_deltaTime * 10.);
    n *= u_randomStrength;

    
    float left = getSensorData(pos, angle + u_sensorAngle, u_sensorDist, u_sensorSize);
    float middle = getSensorData(pos, angle, u_sensorDist, u_sensorSize);
    float right = getSensorData(pos, angle - u_sensorAngle, u_sensorDist, u_sensorSize);

    if (middle > left && middle > right) {
      angle += 0.0; 
    } else if (middle < left && middle < right) {
      angle += (n * 2. - 1.) * u_steeringStrength * u_deltaTime;
    } else if (right > left) {
      angle -= u_steeringStrength * u_deltaTime;
    } else if (left > right) {
      angle += u_steeringStrength * u_deltaTime;
    }

    vec2 direction = vec2(cos(angle), sin(angle));
    vec2 resolution = vec2(u_resolution);
    vec2 centerPos = pos - (resolution * .5 - 1.);
    vec2 centerDirection = normalize(centerPos);
    float damping = smoothstep(0.25, 1., length(centerPos) / min(resolution.x, resolution.y));
    float returnStrength = max(0., dot(centerDirection, direction)) * damping;
    // find the return angle with the cross product
    angle += sign(centerDirection.x * direction.y - centerDirection.y * direction.x) * returnStrength;
    direction = vec2(cos(angle), sin(angle));
    
    t_newPosition = pos + velocity * direction * u_deltaTime;
    t_newPosition = mod(t_newPosition, vec2(u_resolution));
    t_newAngle = angle;
}
