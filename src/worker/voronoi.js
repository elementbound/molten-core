const textureGenerator = require('../texture-generator')

const voronoi = (pointCount, width, height, seamless = true) => {
    const dataBuffer = new Uint8Array(width * height * 3)

    const pixelsCount = width * height
    let pixelsGenerated = 0

    const reportRest = 1000 / 10
    let reportLast = 0

    const gotPixel = (x, y, value) => {
        const byte = (value * 255) | 0
        dataBuffer[3 * (x + y*width) + 0] = byte
        dataBuffer[3 * (x + y*width) + 1] = byte
        dataBuffer[3 * (x + y*width) + 2] = byte
        
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

    textureGenerator.voronoi(gotPixel, pointCount, width, height, seamless)
}

onmessage = event => {
    voronoi(...event.data)
}
