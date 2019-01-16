const VoronoiSampler = require('./voronoi')
const LayeredSampler = require('./layered')

/**
 * Utility functions for samplers. 
 * 
 * @module samplers
 */
module.exports = {
    /**
     * Deserialize sampler based on type.
     * 
     * @param {Object} json Serialized sampler
     * 
     * @return {Object} Deserialized sampler
     * @throws {Error} Throws on unknown sampler types.
     */
    fromJSON: function(json) {
        if(json.type == 'VoronoiSampler') {
            return VoronoiSampler.fromJSON(json)
        } else if(json.type == 'LayeredSampler') {
            return LayeredSampler.fromJSON(json)
        } else {
            throw new Error(`Unknown sampler type: ${json.type}`)
        }
    }
}