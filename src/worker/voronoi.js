const textureGenerator = require('../texture-generator')

const voronoi3 = (pointCount, width, height, depth, seamless = true) => {
    const dataBuffer = new Uint8Array(width * height * depth * 3)

    const pixelsCount = width * height * depth
    let pixelsGenerated = 0

    const reportRest = 1000 / 10
    let reportLast = 0

    const gotPixel = (x, y, z, value) => {
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

        if(pixelsGenerated == pixelsCount) {
            postMessage({
                type: 'done',
                data: dataBuffer
            })
        }
    }

    textureGenerator.voronoi3(gotPixel, pointCount, width, height, depth, seamless)
}

onmessage = event => {
    voronoi3(...event.data)
}
