/**
 * @file Source for texture rendering Web Worker.
 */

const samplers = require('../texture/samplers')

const progressReporter = reportInterval => {
    let reportLast = -1

    return progress => {
        if((performance.now() - reportLast) > reportInterval) {
            postMessage({
                type: 'progress',
                progress: progress
            })

            reportLast = performance.now()
        }
    }
}

/**
 * Convert pixel index to 3D coordinates.
 * 
 * @param {number} index Pixel index
 * @param {number} width Texture width
 * @param {number} height Texture height
 * @param {number} depth Texture depth
 * 
 * @returns {number[]} Position vector
 * 
 * @access private
 */
const indexToCoords = (index, width, height, depth) => [
    index % width,
    (index / width | 0) % height,
    (index / width / height | 0) % depth
]

/**
 * Render a part of the texture.
 * 
 * @param {number[]} range [from, to] range of pixel indices to render
 * @param {number[]} size Texture size, in pixels
 * @param {Object} sampler Sampler to render
 */
const renderPartial = (range, size, sampler) => {
    const [width, height, depth] = size
    const [rangeFrom, rangeTo] = range
    
    const pixelsCount = rangeTo - rangeFrom
    let pixelsGenerated = 0

    const dataBuffer = new Uint8Array(pixelsCount * 3)

    const reporter = progressReporter(1000 / 10)

    for(let i = rangeFrom; i < rangeTo; ++i) {
        const [x, y, z] = indexToCoords(i, ...size)
        
        const texcoords = [x/width, y/height, z/depth]
        const value = sampler.sample(texcoords)
        
        const byte = (value * 255) | 0
        const stride = 3 * (x + y*width + z*width*height - rangeFrom)
        dataBuffer[stride + 0] = byte
        dataBuffer[stride + 1] = byte
        dataBuffer[stride + 2] = 128

        ++pixelsGenerated
        reporter(pixelsGenerated / pixelsCount)
    }

    postMessage({
        type: 'done',
        data: dataBuffer
    })
}

onmessage = event => {
    const message = event.data

    if(message.type == 'partial') {
        renderPartial(message.range, message.size, samplers.fromJSON(message.sampler))
    }
}
