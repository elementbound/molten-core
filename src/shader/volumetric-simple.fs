#version 300 es

precision highp float;
precision highp int;
precision highp sampler3D;

uniform sampler3D diffuse;

in vec3 vUv;
out vec4 out_FragColor;

void main() {
	float value = texture( diffuse, vUv ).r;
	out_FragColor = vec4( value, value, value, 1.0 );
}