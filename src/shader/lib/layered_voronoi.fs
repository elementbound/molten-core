#include</lib/voronoi.fs>

struct layer_t {
    float seed;
    float frequency;
    float weight;
};

float layeredVoronoi(in vec3 at) {
    layer_t[4] layers = layer_t[4] (
        layer_t(0.29442595515488534, 32.0, 1.0),
        layer_t(0.5076444486728089,  16.0, 2.0),
        layer_t(0.4288002010619445,   8.0, 4.0),
        layer_t(0.504267403134538,    4.0, 8.0)
    );
    
    float result = 0.0;
    float fullWeight = 0.0;

    for(int i = 0; i < layers.length(); ++i) {
        result += voronoi(at, layers[i].frequency, layers[i].seed) * layers[i].weight;
        fullWeight += layers[i].weight;
    }
    
    return result / fullWeight;
}