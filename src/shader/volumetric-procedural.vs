#version 300 es

uniform float timeOffset;
uniform float offsetPower;

out vec3 vUv;
out vec3 vUv2;
out float vWeight;

#include</lib/layered_voronoi.fs>

const float PI_HALF = 1.5707963267948966192313216916398;

void main() {
    vec2 mappedUv = position.xz / 2.0;
    mappedUv = (1.0 + mappedUv) / 2.0;
    float mappedWeight = cos(position.y * PI_HALF);
    mappedWeight = pow(mappedWeight, 0.5);

    float offset = mix(layeredVoronoi(vec3(mappedUv, timeOffset)), layeredVoronoi(vec3(uv, timeOffset)), mappedWeight);
    offset = pow(offset, 4.0);
    offset *= offsetPower;

    vec3 transformedPosition = position + normal * offset;

    vUv = vec3(uv, timeOffset);
    vUv2 = vec3(mappedUv, timeOffset);
    vWeight = mappedWeight;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( transformedPosition, 1.0 );
}