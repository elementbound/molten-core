const range = n => 
    [...Array(n).keys()]

module.exports = class SpatialHashContainer {
    constructor(resolution) {
        this.resolution = resolution
        this.buckets = {}
    }

    put(point) {
        const hash = this.hashCoords(point)

        if(!this.buckets[hash]) {
            this.buckets[hash] = [point]
        } else {
            this.buckets[hash].push(point)
        }
    }

    getBucket(hash) {
        if(!this.buckets[hash]) {
            return []
        } else {
            return this.buckets[hash]
        }
    }

    getNeighborHashes(hash) {
        const dimensions = hash.length
        const neighbors = Math.pow(3, dimensions)
        const result = []

        for(let i = 0; i < neighbors; ++i) {
            const neighborBucket = range(dimensions)
                .map((v, axis) => ((i / Math.pow(3, axis) | 0) % 3))
                .map((v, axis) => v + hash[axis] - 1)

            result.push(neighborBucket)
        }

        return result
    }

    hashCoords(point) {
        return point.map(v => (v * this.resolution) | 0)
    }
}