const range = n => 
    [...Array(n).keys()]

const length = ([x, y]) => 
    Math.sqrt(x*x + y*y)

const distance = ([ax, ay], [bx, by]) =>
    length([ax-bx, ay-by])

/**
 * Function to generate a Voronoi texture. 
 * Data is passed back through callback, which receives the pixel position in image space,
 * and the pixel brightness in the [0,1] range.
 * 
 * Example: 
 * ```
    voronoi(8, 256, 256, (x,y, value) => { ... })
   ```
 * 
 * @param {number} pointCount Number of points
 * @param {number} width Image width
 * @param {number} height Image height
 * @param {Function} callback Callback to receive (x, y, value) triplets
 */
const voronoi = (pointCount, width, height, callback) => {
    const points = range(pointCount)
        .map(() => [Math.random(), Math.random()])
        
    for(let y = 0; y < height; ++y) {
        for(let x = 0; x < width; ++x) {
            const u = x / width
            const v = y / height

            const nearestPoints = points
                .map(([px, py]) => ({
                    x: px,
                    y: py,
                    distance: distance([u, v], [px, py])
                }))
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 2)

            const minDst = Math.min(nearestPoints[0].distance, nearestPoints[1].distance)
            const maxDst = Math.max(nearestPoints[0].distance, nearestPoints[1].distance)

            const value = Math.pow(minDst / maxDst, 2)
            callback(x, y, value)
        }
    }
}

module.exports = {
    voronoi
}