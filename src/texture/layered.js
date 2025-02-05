const _ = require('lodash')

/**
 * The layered sampler creates detailed textures, by merging the results of multiplate samplers.
 * 
 * These samplers are organized into **layers**, each layer having its own sampler, transformation and weight.
 * 
 * Texture coordinates are transformed for each layer, then the resulting sample values are averaged based on layer
 * weights.
 */
class LayeredSampler {
    /**
     * Construct instance.
     * 
     * @param {Object[]} layers Layer definitions
     * @param {Object} layer.sampler Sampler to use
     * @param {number[]} [layer.offset] Offset vector
     * @param {number[]} [layer.scale] Scaling
     * @param {number} [layer.weight=1] Weight
     */
    constructor(layers) {
        this.layers = layers

        this.layers.forEach(layer => {
            layer.offset = layer.offset || [0, 0, 0]
            layer.scale = layer.scale || [1, 1, 1]
            layer.weight = layer.weight || 1
        })

        this.normalizeWeights()
    }

    /**
     * Normalize layer weights.
     * >Note: Must be called every time the weights are manually changed.
     * 
     * @access private
     */
    normalizeWeights() {
        const weightSum = this.layers
            .map(layer => layer.weight)
            .reduce((a, b) => a + b, 0)

        if(weightSum) {
            this.layers.forEach(layer => {
                layer.weight /= weightSum
            })
        }
    }

    /**
     * Sample at the given texture coordinates. 
     * 
     * @param {number[]} at Texture coordinates
     * @returns {number} Intensity value
     */
    sample(at) {
        return this.layers
            .map(layer => {
                let transformedCoordinates = at
                transformedCoordinates = _.zip(at, layer.scale).map(([a, b]) => a * b)
                transformedCoordinates = _.zip(at, layer.offset).map(([a, b]) => a + b)

                return layer.sampler.sample(transformedCoordinates) * layer.weight
            })
            .reduce((a, b) => a + b)
    }

    /**
     * Serialize instance as an object ready to be serialized / transferred.
     * 
     * @returns {Object}
     */
    toJSON() {
        const layers = this.layers.map(layer => {
            const serializedSampler = layer.sampler.toJSON()
            const newAttributes = {
                sampler: serializedSampler
            }

            return Object.assign({}, layer, newAttributes)
        })
        
        return {
            type: 'LayeredSampler',
            layers: layers
        }
    }

    /**
     * Deserialize instance.
     * 
     * @param {Object} json Serialized data
     * @returns {LayeredSampler}
     * @see LayeredSampler#toJSON
     */
    static fromJSON(json) {
        const samplers = require('./samplers')

        const layers = json.layers.map(layer => {
            const deserializedSampler = samplers.fromJSON(layer.sampler)
            const newAttributes = {
                sampler: deserializedSampler
            }

            return Object.assign({}, layer, newAttributes)
        })

        return new LayeredSampler(layers)
    }
}

module.exports = LayeredSampler