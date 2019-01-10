const range = n => 
    [...Array(n).keys()]
    
const length3 = ([x, y, z]) => 
    Math.sqrt(x*x + y*y + z*z)

const distance3 = ([ax, ay, az], [bx, by, bz]) =>
    length3([ax-bx, ay-by, az-bz])

/**
 * Function to generate a volumetric Voronoi texture. 
 * Data is passed back through callback, which receives the pixel position in image space,
 * and the pixel brightness in the [0,1] range.
 * 
 * Example: 
 * ```
    voronoi(8, 256, 256, (x,y,z, value) => { ... })
   ```
 * 
 * @param {Function} callback Callback to receive (x, y, z, value) triplets
 * @param {number} pointCount Number of points
 * @param {number} width Image width
 * @param {number} height Image height
 * @param {number} depth Image depth
 * @param {bool} seamless Generate seamless image
 */
const voronoi3 = (callback, pointCount, width, height, depth, seamless = true) => {
    let points = []

    if(!seamless) {
        points = range(pointCount)
            .map(() => [Math.random(), Math.random(), Math.random()])
    } else {
        // Make sure point count is divisible by 8
        pointCount = (pointCount / 8 | 0) * 8

        // Generate points for only one quadrant of the whole texture
        const pointsQuadrant = range(pointCount / 8)
            .map(() => [Math.random(), Math.random(), Math.random()])

        const halfCount = pointCount / 2
        const quarterCount = pointCount / 4
        const eighthCount = pointCount / 8

        // Stitch them mirrored to all quarters
        points = range(pointCount)
            .map(idx => {
                const srcIdx = idx % eighthCount
                const mirrorX = (idx / eighthCount | 0) % 2 ? 1 : -1
                const mirrorY = (idx / quarterCount | 0) % 2 ? 1 : -1
                const mirrorZ = (idx / halfCount | 0) % 2 ? 1 : -1

                let [x, y, z] = pointsQuadrant[srcIdx]

                return [
                    (1 + (x * mirrorX)) / 2,
                    (1 + (y * mirrorY)) / 2,
                    (1 + (z * mirrorZ)) / 2
                ]
            })
    }
        
    for(let z = 0; z < depth; ++z) {
        for(let y = 0; y < height; ++y) {
            for(let x = 0; x < width; ++x) {
                const u = x / width
                const v = y / height
                const w = z / depth

                const nearestPoints = points
                    .map(([px, py, pz]) => ({
                        x: px,
                        y: py,
                        z: pz,
                        distance: distance3([u, v, w], [px, py, pz])
                    }))
                    .sort((a, b) => a.distance - b.distance)

                const minDst = Math.min(nearestPoints[0].distance, nearestPoints[1].distance)
                const maxDst = Math.max(nearestPoints[0].distance, nearestPoints[1].distance)

                const value = Math.pow(minDst / maxDst, 2)
                callback(x, y, z, value)
            }
        }
    }
}

module.exports = {
    voronoi3
}