#version 300 es

uniform float z;
out vec3 vUv;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position.xyz, 1.0 );
    vUv = vec3(uv.xy, z);
}