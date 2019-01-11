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

    isValid(at) {
        return zip(at, this.size)
            .map(([coordinate, max]) => [coordinate | 0, max])
            .every(([coordinate, max]) => coordinate >= 0 && coordinate < max)
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

        this._points = range(pointCount)
            .map(() => size.map(v => v * Math.random()))

        this._populateHash(hashResolution)
    }

    /**
     * Sample at the given UVW coordinates. 
     * @param {*} at Array of coordinates
     */
    sample(at) {
        at = zip(at, this.size).map(([coordinate, scale]) => coordinate*scale)
        
        const hashAt = at.map(this._hash)

        let neighbors = this._hashmap.get(hashAt)
            .map(point => ({
                position: point,
                distance: distance(point, at)
            }))
            .sort((a, b) => a.distance - b.distance)

        if(neighbors.length < 2) 
            return 0
            
        const minDst = Math.min(neighbors[0].distance, neighbors[1].distance)
        const maxDst = Math.max(neighbors[0].distance, neighbors[1].distance)

        return minDst / maxDst
    }

    toJSON() {
        return {
            type: 'VoronoiSampler',
            size: this.size,
            frequency: this.frequency,
            seamless: this.seamless,

            internals: {
                points: this._points
            }
        }
    }

    static fromJSON(json) {
        let result = new VoronoiSampler(json.size, json.frequency, json.seamless)
        result._points = json.internals.points
        result._populateHash(4)

        return result
    }

    _populateHash(hashResolution) {
        this._hash = value => (value * hashResolution) | 0
        const hashSize = this.size.map(v => (v * hashResolution) | 0)

        this._hashmap = new ArrayN(hashSize)
        for(let i = 0; i < this._hashmap.data.length; ++i) {
            this._hashmap.data[i] = []
        }

        const dimensions = this.size.length
        const offsets = range(Math.pow(3, dimensions)).
            map(v => range(dimensions).map(i => (v / Math.pow(3, i) | 0) % 3)).
            map(offset => offset.map(v => v-1))

        this._points
            .map(point => ({
                position: point,
                hashPosition: point.map(v => (v * hashResolution) | 0)
            }))
            .forEach(p => 
                offsets
                    .map(offset => zip(offset, p.hashPosition).map(([a, b]) => a+b))
                    .filter(offset => this._hashmap.isValid(offset))
                    .forEach(hashPosition => this._hashmap.get(hashPosition).push(p.position))
            )
    }
}