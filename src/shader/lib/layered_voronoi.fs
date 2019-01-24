#include</lib/voronoi.fs>

struct layer_t {
    float seed;
    float frequency;
    float weight;
};

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