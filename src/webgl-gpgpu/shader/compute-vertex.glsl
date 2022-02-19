#version 300 es

uniform float u_deltaTime;

in vec3 a_oldPosition;
in vec3 a_velocity;

out vec3 t_newPosition;

void main() {
    t_newPosition = a_oldPosition + a_velocity * u_deltaTime;
    t_newPosition = mod(t_newPosition, vec3(1.));
}
