const VoronoiSampler = require('../texture/voronoi')

const voronoi3 = (width, height, depth, seamless = true) => {
    const sampler = new VoronoiSampler([1,1,1], 128, seamless)
    const dataBuffer = new Uint8Array(width * height * depth * 3)

    const pixelsCount = width * height * depth
    let pixelsGenerated = 0

    const reportRest = 1000 / 10
    let reportLast = 0

    for(let x = 0; x < width; ++x) {
        for(let y = 0; y < height; ++y) {
            for(let z = 0; z < depth; ++z) {
                const texcoords = [x/width, y/height, z/depth]
                const value = sampler.sample(texcoords)
                
                const byte = (value * 255) | 0
                const stride = 3 * (x + y*width + z*width*height)
                dataBuffer[stride + 0] = byte
                dataBuffer[stride + 1] = byte
                dataBuffer[stride + 2] = byte
        
                ++pixelsGenerated
        
                if((performance.now() - reportLast) > reportRest) {
                    postMessage({
                        type: 'progress',
                        progress: pixelsGenerated / pixelsCount
                    })
        
                    reportLast = performance.now()
                }
            }
        }
    }

    postMessage({
        type: 'done',
        data: dataBuffer
    })
}

onmessage = event => {
    const message = event.data

    if(message.type == 'voronoi') {
        voronoi3(...message.args)
    }
}
