#version 300 es

precision highp float;
precision highp int;
precision highp sampler3D;

in vec3 vUv;
out vec4 out_FragColor;

// Gold Noise ©2015 dcerisano@standard3d.com 
//  - based on the Golden Ratio, PI and Square Root of Two
//  - superior distribution
//  - fastest noise generator function
//  - works with all chipsets (including low precision)

precision lowp    float;

const float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio   
const float PI  = 3.14159265358979323846264 * 00000.1; // PI
const float SQ2 = 1.41421356237309504880169 * 10000.0; // Square Root of Two

float gold_noise(in vec2 coordinate, in float seed){
    return fract(tan(distance(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);
}

// ---

const vec3[27] TILE_OFFSETS = vec3[27](
    vec3(-1,-1,-1),
    vec3(0,-1,-1),
    vec3(1,-1,-1),
    vec3(-1,0,-1),
    vec3(0,0,-1),
    vec3(1,0,-1),
    vec3(-1,1,-1),
    vec3(0,1,-1),
    vec3(1,1,-1),
    vec3(-1,-1,0),
    vec3(0,-1,0),
    vec3(1,-1,0),
    vec3(-1,0,0),
    vec3(0,0,0),
    vec3(1,0,0),
    vec3(-1,1,0),
    vec3(0,1,0),
    vec3(1,1,0),
    vec3(-1,-1,1),
    vec3(0,-1,1),
    vec3(1,-1,1),
    vec3(-1,0,1),
    vec3(0,0,1),
    vec3(1,0,1),
    vec3(-1,1,1),
    vec3(0,1,1),
    vec3(1,1,1)
);

struct layer_t {
    float seed;
    float frequency;
    float weight;
};

vec3 gold_noise(in vec3 at) {
    return vec3(
    	gold_noise(at.xy, 1e2 + 17.0 * (1.0 + at.z)),
        gold_noise(at.xy, 1e2 + 31.0 * (1.0 + at.z)),
        gold_noise(at.xy, 1e2 + 27.0 * (1.0 + at.z))
    );
}

vec3 gold_noise(in vec3 at, in float seed) {
    return vec3(
    	gold_noise(at.xy, 1e8 / (331.0 * seed + 457.0 * (1.0 + at.z))),
        gold_noise(at.xy, 1e8 / (239.0 * seed + 401.0 * (1.0 + at.z))),
        gold_noise(at.xy, 1e8 / (191.0 * seed + 757.0 * (1.0 + at.z)))
    );
}

vec3 quantize(vec3 v, float multiplier) {
    return floor(v * multiplier);
}

vec3 pointInTile(vec3 tile, float seed, float frequency) {
    return tile + gold_noise(mod(tile, frequency), seed);
}

float voronoi(vec3 at, float frequency, float seed) {
    vec3 currentTile = quantize(at, frequency);
    at *= frequency;
    
    float closest[2] = float[2](1.0, 1.0);
    for(int i = 0; i < TILE_OFFSETS.length(); ++i) {
        vec3 point = pointInTile(currentTile + TILE_OFFSETS[i], seed, frequency);
        float dst = distance(at, point);
        
        if(dst < closest[0]) {
            closest[1] = closest[0];
            closest[0] = dst;
        } else if(dst < closest[1]) {
            closest[1] = dst;
        }
    }
    
    return min(closest[0], closest[1]) / max(closest[0], closest[1]);
}

float layeredVoronoi(in vec3 at) {
    layer_t[4] layers = layer_t[4] (
        layer_t(0.29442595515488534, 8.0, 0.0625),
        layer_t(0.5076444486728089,  4.0, 0.125 ),
        layer_t(0.4288002010619445,  2.0, 0.25  ),
        layer_t(0.504267403134538,   1.0, 0.5   )
    );
    
    float result = 0.0;
    
    for(int i = 0; i < layers.length(); ++i) {
        result += voronoi(at, layers[i].frequency, layers[i].seed) * layers[i].weight;
    }
    
    return result;
}

void main() {
    vec3 uv = vUv;
    uv.x *= 2.0;

	float value = layeredVoronoi(uv);
	out_FragColor = vec4( value, value, value, 1.0 );
}