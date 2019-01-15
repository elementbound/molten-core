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
        this.seamless = seamless || this.size.map(() => true)

        const volume = this.size.reduce((a, b) => a * b, 1)
        const pointCount = volume * frequency

        this.points = range(pointCount)
            .map(() => size.map(v => v * Math.random()))

        seamless.forEach((seamlessness, axis) => {
            if(seamlessness) {
                this.makeSeamless(axis)
            }
        })
    }

    /**
     * Sample at the given UVW coordinates. 
     * @param {*} at Array of coordinates
     */
    sample(at) {
        at = zip(at, this.size).map(([coordinate, scale]) => coordinate*scale)
        
        let neighbors = this.points
            .map(point => ({
                position: point,
                distance: distance(point, at)
            }))
            .sort((a, b) => a.distance - b.distance)
            
        const minDst = Math.min(neighbors[0].distance, neighbors[1].distance)
        const maxDst = Math.max(neighbors[0].distance, neighbors[1].distance)

        return minDst / maxDst
    }

    makeSeamless(axis) {
        const offset = this.size.map((v, i) => (i == axis) ? this.size[axis] : 0)

        const negativePoints = this.points
            .map(point => point.map((v, i) => v - offset[i]))
            
        const positivePoints = this.points
            .map(point => point.map((v, i) => v + offset[i]))

        this.points.push(...negativePoints, ...positivePoints)
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

        return result
    }
}