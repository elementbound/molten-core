#version 300 es

precision highp float;
precision highp int;
precision highp sampler3D;

#include</lib/layered_voronoi.fs>

in vec3 vUv;

out vec4 out_FragColor;

void main() {
	float v = layeredVoronoi(vUv);
	out_FragColor = vec4( v, v, v, 1.0 );
}