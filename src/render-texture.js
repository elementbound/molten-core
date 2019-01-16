/**
 * Module to manage multi-threaded texture rendering, using WebWorkers.
 * 
 * @module renderTexture
 */

const _ = require('lodash')

/** 
 * @callback progressCallback
 * 
 * @param {number} progress Current progress in the (0,1) range
 */

module.exports = {
    /**
     * Generate a 3D texture.
     * 
     * @param {Object} options Options
     * @param {Object} options.sampler Sampler to render
     * @param {number[]} [options.size=[64, 64, 64]] Texture size, in pixels
     * @param {number} [options.threadCount] Thread count
     * @param {progressCallback} [options.onProgress] Progress callback
     */
    render: function(options) {
        return new Promise(resolve => {
            options.size = options.size || [64, 64, 64]
            options.onProgress = (typeof options.onProgress == 'function') ? options.onProgress : undefined
            options.threadCount = options.threadCount || navigator.hardwareConcurrency
    
            const [width, height, depth] = options.size
            const {sampler, onProgress, threadCount} = options
            
            const pixelsCount = width * height * depth
            const dataBuffer = new Uint8Array(pixelsCount * 3)
    
            let remainingWorkers = threadCount
            let workerProgress = _.range(threadCount).fill(0)
    
            _.range(threadCount)
                .forEach(i => {
                    const worker = new Worker('render-texture.js')
                    const range = [
                        (i / threadCount * pixelsCount) | 0, 
                        ((i + 1) / threadCount * pixelsCount) | 0
                    ]
                    
                    worker.postMessage({
                        type: 'partial',
                        range: range,
                        size: [width, height, depth],
                        sampler: sampler.toJSON()
                    })
    
                    worker.onmessage = event => {
                        const message = event.data
    
                        if(message.type == 'progress' && onProgress) {
                            workerProgress[i] = message.progress
    
                            onProgress(workerProgress.reduce((a, b) => a + b/threadCount))
                        } else if(message.type == 'done') {
                            dataBuffer.set(message.data, range[0]*3)
                            workerProgress[i] = 1
    
                            --remainingWorkers
                            if(remainingWorkers == 0) {
                                resolve(dataBuffer)
                            }
                        }
                    }
                })
        })
    }
}