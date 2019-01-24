// Gold Noise ©2015 dcerisano@standard3d.com 
//  - based on the Golden Ratio, PI and Square Root of Two
//  - superior distribution
//  - fastest noise generator function
//  - works with all chipsets (including low precision)

// precision lowp    float;

const float PHI = 1.61803398874989484820459 * 00000.1; // Golden Ratio   
const float PI  = 3.14159265358979323846264 * 00000.1; // PI
const float SQ2 = 1.41421356237309504880169 * 10000.0; // Square Root of Two

float gold_noise(in vec2 coordinate, in float seed){
    return fract(tan(distance(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);
}

vec3 gold_noise(in vec3 at) {
    return vec3(
    	gold_noise(at.xy, 1e2 + 17.0 * (1.0 + at.z)),
        gold_noise(at.yx, 1e2 + 31.0 * (1.0 + at.z)),
        gold_noise(at.xz, 1e2 + 27.0 * (1.0 + at.z))
    );
}

vec3 gold_noise(in vec3 at, in float seed) {
    return vec3(
    	gold_noise(at.xy, 1e8 / (331.0 * seed + 457.0 * (1.0 + at.z))),
        gold_noise(at.yx, 1e8 / (239.0 * seed + 401.0 * (1.0 + at.z))),
        gold_noise(at.xz, 1e8 / (191.0 * seed + 757.0 * (1.0 + at.z)))
    );
}