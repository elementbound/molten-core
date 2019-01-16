const _ = require('lodash')
const VoronoiSampler = require('./texture/voronoi')

/** 
 * @callback progressCallback
 * 
 * @param {number} progress Current progress in the (0,1) range
 */

/**
 * Generate a 3D Voronoi texture.
 * 
 * @see VoronoiSampler
 * 
 * @param {number} width Texture width
 * @param {number} height Texture height
 * @param {number} depth Texture depth
 * @param {progressCallback} [onProgress] Progress callback
 */
const voronoi3 = (width, height, depth, onProgress) => {
    return new Promise(resolve => {
        onProgress = (typeof onProgress == 'function') ? onProgress : undefined

        const dataBuffer = new Uint8Array(width * height * depth * 3)
        const threadCount = 12

        const pixelsCount = width * height * depth
        const sampler = new VoronoiSampler({
            size: [3.14 / 2, 1, 1],
            seamless: [true, false, true]
        })

        let remainingWorkers = threadCount

        _.range(threadCount)
            .forEach(i => {
                const worker = new Worker('voronoi.js')
                const range = [
                    (i / threadCount * pixelsCount) | 0, 
                    ((i + 1) / threadCount * pixelsCount) | 0
                ]
                
                worker.postMessage({
                    type: 'partial',
                    id: i,
                    range: range,
                    size: [width, height, depth],
                    sampler: sampler.toJSON()
                })

                worker.onmessage = event => {
                    const message = event.data

                    if(message.type == 'progress' && onProgress) {
                        onProgress(message.progress)
                    } else if(message.type == 'done') {
                        dataBuffer.set(message.data, range[0]*3)

                        --remainingWorkers
                        if(remainingWorkers == 0) {
                            resolve(dataBuffer)
                        }
                    }
                }
            })
    })
}

module.exports = voronoi3