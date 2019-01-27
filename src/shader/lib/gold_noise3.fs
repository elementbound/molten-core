#include</lib/gold_noise.fs>

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