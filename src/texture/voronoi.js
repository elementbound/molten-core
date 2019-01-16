const SpatialHashContainer = require('./spatialhash.js')

const zip = (a, b) => 
    [...a.keys()].map(
        i => [a[i], b[i]]
    )

const length = v => 
    Math.sqrt(v.map(c => c*c).reduce((a, b) => a+b, 0))

const distance = (a, b) =>
    length(zip(a, b).map(([ac, bc]) => ac - bc))

class VoronoiSampler {
    /**
     * Construct sampler instance.
     * 
     * @param {Object} options Sampler options
     * @param {Number[]} [options.size=[1, 1, 1]] Domain size
     * @param {Boolean[]} [options.seamless=[false]] Seamlessness for each axis
     * @param {Number[][]} [options.points] Don't generate points, use those provided
     */
    constructor(options) {
        // Parse options
        options = options || {}
        options.size = options.size || [1, 1, 1]
        options.seamless = (options.seamless && Array.isArray(options.seamless)) ? options.seamless : options.size.map(() => false)
        options.points = Array.isArray(options.points) ? options.points : undefined

        // Initialize members
        this.size = options.size
        this.seamless = options.seamless
        this.spatialResolution = 4 // FIXED

        const needsPointGeneration = !options.points

        if(needsPointGeneration) {
            this.points = this.generatePoints()

            this.seamless.forEach((seamlessness, axis) => {
                if(seamlessness) {
                    this.makeSeamless(axis)
                }
            })
        } else {
            this.points = options.points
        }

        this.populateSpatialContainer()
    }

    /**
     * Sample at the given texture coordinates. 
     * 
     * @param {number[]} at Texture coordinates
     * @returns {number} Intensity value
     */
    sample(at) {
        at = zip(at, this.size).map(([coordinate, scale]) => (coordinate % 1) * scale)

        const hashAt = this.spatialContainer.hashCoords(at)
        const buckets = this.spatialContainer.getNeighborHashes(hashAt)
        
        const neighbors = buckets
            .flatMap(bucket => this.spatialContainer.getBucket(bucket))
            .map(point => ({
                position: point,
                distance: distance(point, at)
            }))
            .sort((a, b) => a.distance - b.distance)

        const minDst = Math.min(neighbors[0].distance, neighbors[1].distance)
        const maxDst = Math.max(neighbors[0].distance, neighbors[1].distance)

        return minDst / maxDst
    }

    /**
     * Generate points for texture generation.
     * 
     * @returns {number[][]} Array of vectors
     * @access private
     */
    generatePoints() {
        const spatialStep = 1 / this.spatialResolution
        const spatialSize = this.size.map(v => (v * this.spatialResolution) | 0)
        const result = []

        // TODO: n dimensions?
        for(let x = 0; x < spatialSize[0]; ++x) {
            for(let y = 0; y < spatialSize[1]; ++y) {
                for(let z = 0; z < spatialSize[2]; ++z) {
                    const point = [
                        (x + Math.random()) * spatialStep,
                        (y + Math.random()) * spatialStep,
                        (z + Math.random()) * spatialStep
                    ]

                    result.push(point)
                }
            }
        }

        return result
    }

    /**
     * Map the instance's points in a way to make them seamless on the given axis.
     * *NOTE:* this may or may not change the count of points.
     * 
     * @param {integer} axis Axis index
     * @returns {void}
     * @access private
     */
    makeSeamless(axis) {
        const offset = this.size.map((v, i) => (i == axis) ? this.size[axis] : 0)

        const negativePoints = this.points
            .map(point => point.map((v, i) => v - offset[i]))
            
        const positivePoints = this.points
            .map(point => point.map((v, i) => v + offset[i]))

        this.points.push(...negativePoints, ...positivePoints)
    }

    populateSpatialContainer() {
        this.spatialContainer = new SpatialHashContainer(this.spatialResolution)
        this.points.forEach(point => this.spatialContainer.put(point))
    }

    /**
     * Serialize instance as an object ready to be serialized / transferred.
     * 
     * @returns {Object}
     */
    toJSON() {
        return {
            type: 'VoronoiSampler',
            options: {
                size: this.size,
                seamless: this.seamless,
                points: this.points
            }
        }
    }

    /**
     * Deserialize instance.
     * 
     * @param {Object} json Serialized data
     * @returns {VoronoiSampler}
     * @see VoronoiSampler#toJSON
     */
    static fromJSON(json) {
        return new VoronoiSampler(json.options)
    }
}

module.exports = VoronoiSampler