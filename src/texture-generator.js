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
 * @param {Function} callback Callback to receive (x, y, value) triplets
 * @param {number} pointCount Number of points
 * @param {number} width Image width
 * @param {number} height Image height
 * @param {bool} seamless Generate seamless image
 */
const voronoi = (callback, pointCount, width, height, seamless = true) => {
    let points = []

    if(!seamless) {
        points = range(pointCount)
            .map(() => [Math.random(), Math.random()])
    } else {
        // Make sure point count is divisible by four
        pointCount = (pointCount / 4 | 0) * 4

        // Generate points for only one quarter of the whole texture
        const pointsQuarter = range(pointCount / 4)
            .map(() => [Math.random(), Math.random()])

        const halfCount = pointCount / 2
        const quarterCount = pointCount / 4

        // Stitch them mirrored to all quarters
        points = range(pointCount)
            .map(idx => {
                const srcIdx = idx % quarterCount
                const mirrorX = (idx / quarterCount | 0) % 2 ? 1 : -1
                const mirrorY = (idx / halfCount | 0) % 2 ? 1 : -1

                let [x, y] = pointsQuarter[srcIdx]

                return [
                    (1 + (x * mirrorX)) / 2,
                    (1 + (y * mirrorY)) / 2
                ]
            })
    }
        
    for(let y = 0; y < height; ++y) {
        for(let x = 0; x < width; ++x) {
            const u = x / width
            const v = y / height

            const nearestPoints = points
                .map(([px, py]) => ({
                    x: px,
                    y: py,
                    distance: distance([u + 0, v + 0], [px, py])
                }))
                .sort((a, b) => a.distance - b.distance)
                // .slice(0, 2)

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