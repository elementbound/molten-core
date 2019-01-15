const SpatialHashContainer = require('./spatialhash.js')

const range = n => 
    [...Array(n).keys()]

const zip = (a, b) => 
    [...a.keys()].map(
        i => [a[i], b[i]]
    )

const length = v => 
    Math.sqrt(v.map(c => c*c).reduce((a, b) => a+b, 0))

const distance = (a, b) =>
    length(zip(a, b).map(([ac, bc]) => ac - bc))

module.exports = class VoronoiSampler {
    constructor(size, frequency, seamless) {
        this.size = size
        this.frequency = frequency
        this.seamless = seamless || this.size.map(() => true)
        this.spatialResolution = 4 // FIXED

        this.points = []

        this.generatePoints()

        seamless.forEach((seamlessness, axis) => {
            if(seamlessness) {
                this.makeSeamless(axis)
            }
        })

        this.populateSpatialContainer()
    }

    /**
     * Sample at the given UVW coordinates. 
     * @param {*} at Array of coordinates
     */
    sample(at) {
        at = zip(at, this.size).map(([coordinate, scale]) => coordinate*scale)

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

    generatePoints() {
        const spatialStep = 1 / this.spatialResolution
        const spatialSize = this.size.map(v => (v * this.spatialResolution) | 0)

        // TODO: n dimensions?
        for(let x = 0; x < spatialSize[0]; ++x) {
            for(let y = 0; y < spatialSize[1]; ++y) {
                for(let z = 0; z < spatialSize[2]; ++z) {
                    const point = [
                        (x + Math.random()) * spatialStep,
                        (y + Math.random()) * spatialStep,
                        (z + Math.random()) * spatialStep
                    ]

                    this.points.push(point)
                }
            }
        }
    }

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

    toJSON() {
        return {
            type: 'VoronoiSampler',
            size: this.size,
            frequency: this.frequency,
            seamless: this.seamless,

            internals: {
                points: this.points
            }
        }
    }

    static fromJSON(json) {
        let result = new VoronoiSampler(json.size, json.frequency, json.seamless)
        result.points = json.internals.points
        result.populateSpatialContainer()

        return result
    }
}