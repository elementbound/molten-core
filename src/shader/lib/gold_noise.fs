// Source: https://stackoverflow.com/a/28095165
// Also here: https://www.shadertoy.com/view/ltB3zD

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