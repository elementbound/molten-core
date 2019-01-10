const textureGenerator = require('../texture-generator')

const voronoi = (pointCount, width, height) => {
    const dataBuffer = new Uint8Array(width * height * 3)

    const pixelsCount = width * height
    let pixelsGenerated = 0

    const gotPixel = (x, y, value) => {
        const byte = (value * 255) | 0
        dataBuffer[3 * (x + y*width) + 0] = byte
        dataBuffer[3 * (x + y*width) + 1] = 0 // (x / width) * 255 | 0
        dataBuffer[3 * (x + y*width) + 2] = 0 // (y / height) * 255 | 0

        ++pixelsGenerated

        if((pixelsGenerated % 8192) == 0) {
            postMessage({
                type: 'progress',
                progress: pixelsGenerated / pixelsCount
            })
        }

        if(pixelsGenerated == pixelsCount) {
            postMessage({
                type: 'done',
                data: dataBuffer
            })
        }
    }

    textureGenerator.voronoi(pointCount, width, height, gotPixel)
}

onmessage = event => {
    voronoi(...event.data)
}
