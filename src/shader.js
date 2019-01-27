const sources = {
    '/volumetric-simple.vs': require('./shader/volumetric-simple.vs'),
    '/volumetric-simple.fs': require('./shader/volumetric-simple.fs'),
    '/volumetric-procedural.fs': require('./shader/volumetric-procedural.fs'),
    '/lib/gold_noise.fs': require('./shader/lib/gold_noise.fs'),
    '/lib/gold_noise3.fs': require('./shader/lib/gold_noise3.fs'),
    '/lib/voronoi.fs': require('./shader/lib/voronoi.fs'),
    '/lib/layered_voronoi.fs': require('./shader/lib/layered_voronoi.fs')
}

module.exports = {
    /**
     * Process known directives in shader source.
     * 
     * @param {string} source source
     */
    processSource: function(source) {
        const pattern = /^#include<(.*)>/m
        let result = source
        
        while(pattern.test(result)) {
            result = result.replace(pattern, (match, p1) => 
                sources[p1] || `// Unknown include: ${match}`
            )
        }

        return result
    }
}