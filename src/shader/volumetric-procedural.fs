#version 300 es

precision highp float;
precision highp int;
precision highp sampler3D;

#include</lib/layered_voronoi.fs>

in vec3 vUv;
out vec4 out_FragColor;

void main() {
    vec3 uv = vUv;
    uv.x *= 2.0;

	float value = layeredVoronoi(uv);
	out_FragColor = vec4( value, value, value, 1.0 );
}