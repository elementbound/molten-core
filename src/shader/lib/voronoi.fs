#include</lib/gold_noise.fs>

const vec3[27] TILE_OFFSETS = vec3[27](
    vec3(-1,-1,-1), vec3( 0,-1,-1), vec3( 1,-1,-1),
    vec3(-1, 0,-1), vec3( 0, 0,-1), vec3( 1, 0,-1),
    vec3(-1, 1,-1), vec3( 0, 1,-1), vec3( 1, 1,-1),
    vec3(-1,-1, 0), vec3( 0,-1, 0), vec3( 1,-1, 0),
    vec3(-1, 0, 0), vec3( 0, 0, 0), vec3( 1, 0, 0),
    vec3(-1, 1, 0), vec3( 0, 1, 0), vec3( 1, 1, 0),
    vec3(-1,-1, 1), vec3( 0,-1, 1), vec3( 1,-1, 1),
    vec3(-1, 0, 1), vec3( 0, 0, 1), vec3( 1, 0, 1),
    vec3(-1, 1, 1), vec3( 0, 1, 1), vec3( 1, 1, 1)
);

vec3 quantize(vec3 v, float multiplier) {
    return floor(v * multiplier);
}

vec3 pointInTile(vec3 tile, float seed, float frequency) {
    vec3 offset = gold_noise(mod(tile, frequency), seed);
    offset = clamp(offset, 0.0, 1.0);
    return tile + offset / 1.0;
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