#version 300 es

precision highp float;
precision highp int;
precision highp sampler3D;

#include</lib/layered_voronoi.fs>

in vec3 vUv;
in vec3 vUv2;
in float vWeight;

out vec4 out_FragColor;

void main() {
	float value = mix(layeredVoronoi(vUv2), layeredVoronoi(vUv), vWeight);
    vec3 color = vec3(
        value * 4.0,
        (value - 0.25) / 0.75, 
        (value - 0.875) / 0.125
    );

	out_FragColor = vec4( saturate(color), 1.0 );
}