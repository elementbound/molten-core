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

class ArrayN {
    constructor(size) {
        this.size = size
        this.data = new Array(size.reduce((a, b) => a*b, 1))

        this._indexMultipliers = [1, ...this.size]
    }

    get(at) {
        return this.data[this._index(at)]
    }

    set(at, value) {
        this.data[this._index(at)] = value
    }

    _index(at) {
        at = at.map(v => v | 0)

        return zip(at, this._indexMultipliers)
            .reduce((accumulator, [a, multiplier]) => accumulator*multiplier + a, 0)
    }
}

module.exports = class VoronoiSampler {
    constructor(size, frequency, seamless) {
        this.size = size
        this.frequency = frequency
        this.seamless = seamless

        const volume = this.size.reduce((a, b) => a * b, 1)
        const pointCount = volume * frequency
        const hashResolution = 4
        const hashSize = size.map(v => (v * hashResolution) | 0)

        this._hash = value => (value * hashResolution) | 0

        this._points = range(pointCount)
            .map(() => size.map(v => v * Math.random()))

        this._hashmap = new ArrayN(hashSize)
        for(let i = 0; i < this._hashmap.data.length; ++i) {
            this._hashmap.data[i] = []
        }

        this._points
            .map(point => ({
                position: point,
                hashPosition: point.map(v => (v * hashResolution) | 0)
            }))
            .forEach(p => 
                this._hashmap.get(p.hashPosition).push(p.position)
            )
    }

    /**
     * Sample at the given UVW coordinates. 
     * @param {*} at Array of coordinates
     */
    sample(at) {
        at = zip(at, this.size).map(([coordinate, scale]) => coordinate*scale)
        
        const hashAt = at.map(this._hash)

        // TODO: cache this
        let offsets = hashAt.map((v, i, a) => a.map(j => j == i ? 1 : 0))
        offsets = offsets.concat(offsets.map(v => -v))
        offsets = offsets.map(o => zip(o, hashAt).map(([a, b]) => a + b))

        let sectors = [hashAt, ...offsets]
        let neighbors = sectors
            .map(sector => this._hashmap.get(sector))
            .reduce((a, b) => a.concat(b), [])
            .map(point => ({
                position: point,
                distance: distance(point, at)
            }))
            .sort((a, b) => a.distance - b.distance)
            
        const minDst = Math.min(neighbors[0].distance, neighbors[1].distance)
        const maxDst = Math.max(neighbors[0].distance, neighbors[1].distance)

        return minDst / maxDst
    }
}