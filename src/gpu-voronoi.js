const three = require('three')
const shader = require('./shader')

/**
 * Create a three.js renderer.
 * 
 * @returns {three.WebGLRenderer} renderer
 */
const initRenderer = () => {
    const canvas = document.createElement( 'canvas' )
    const renderContext = canvas.getContext( 'webgl2', { preserveDrawingBuffer: true } )

    canvas.style.zIndex = 1024
    document.body.appendChild(canvas)
    console.log(canvas)

    return {
        canvas: canvas,
        context: renderContext,
        renderer: new three.WebGLRenderer( { canvas: canvas, context: renderContext } )
    }
}

const initMaterial = () => {
    const vertexShader = shader.processSource(require('./shader/simple.vs'))
    const fragmentShader = shader.processSource(require('./shader/voronoi-texture.fs'))
    
    const material = new three.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            z: { value: 0 }
        }
    })

    return material
}

const render = (size) => 
    new Promise((resolve, reject) => {
        const [width, height, depth] = size

        const {renderer, context} = initRenderer()
        renderer.setSize(width, height)

        const material = initMaterial()
        const scene = new three.Scene()

        const camera = new three.OrthographicCamera(-1, -1, 1, 1, 0.5, 2)
        camera.position = new three.Vector3(0, 0, 1)
        camera.lookAt(0, 0, 0)
        scene.add(camera)

        const geometry = new three.PlaneGeometry(2, 2)
        const mesh = new three.Mesh(geometry, material)
        scene.add(mesh)

        // Create an RGBA array
        const data = new Uint8Array(width * height * depth * 4)
        const frame = new Uint8Array(width * height * 4)

        // Render each frame
        const renderFrames = z => {
            if(z >= depth) {
                resolve(data)
                return
            }

            const offset = z * (width * height * 4)

            material.uniforms.z.value = z / depth
            material.needsUpdate = true
            renderer.render(scene, camera)
            context.flush()
            context.finish()

            context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, frame)
            data.set(frame, offset)

            console.log(frame.filter(v => v != 0))
            console.log(`${z}/${depth} = ${(z / depth) * 100 | 0}%`)

            // console.log(renderer.domElement.toDataURL())
            window.requestAnimationFrame(() => renderFrames(z+1))
        }

        renderFrames(0)
    })

module.exports = {
    render
}