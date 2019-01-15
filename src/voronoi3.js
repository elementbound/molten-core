const VoronoiSampler = require('./texture/voronoi')

const range = n => 
    [...Array(n).keys()]

module.exports = (width, height, depth, onProgress) => {
    return new Promise(resolve => {
        const dataBuffer = new Uint8Array(width * height * depth * 3)
        const threadCount = 12

        const pixelsCount = width * height * depth
        const sampler = new VoronoiSampler([3.14 / 2, 1, 1], 1024, [true, false, true])

        let remainingWorkers = threadCount

        range(threadCount)
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

                    if(message.type == 'progress') {
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