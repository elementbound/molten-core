#version 300 es

uniform float timeOffset;
out vec3 vUv;

void main() {

    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    vUv = vec3(uv.xy, timeOffset);
}