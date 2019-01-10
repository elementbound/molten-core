const three = require('three')

const generateVoronoi = (pointCount, width, height, depth, onProgress) => 
    new Promise((resolve, reject) => {
        const worker = new Worker('voronoi.js')
        worker.postMessage([pointCount, width, height, depth])

        worker.onmessage = event => {
            const message = event.data

            if(message.type == 'progress' && onProgress) {
                onProgress(message.progress)
            } else if(message.type == 'done') {
                resolve(message.data)
            }
        }
    })

const context = {
    renderer: undefined,
    scene: undefined,
    camera: undefined,
    texture: undefined,
    material: undefined
}

const setup = () => {
    const canvas = document.createElement( 'canvas' )
    const renderContext = canvas.getContext( 'webgl2' )
    const renderer = new three.WebGLRenderer( { canvas: canvas, context: renderContext } )

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    context.renderer = renderer
}

const createTexture = async () => {
    const consoleDiv = document.querySelector('.console')
    const size = [128, 128, 128]
    const points = 256

    const start = performance.now()
    const data = await generateVoronoi(points, ...size, progress => {
        let text = `Generating Voronoi texture ${(progress*10000 | 0) / 100}%`
        consoleDiv.innerHTML = text
    })
    consoleDiv.innerHTML = `Generated Voronoi texture in ${performance.now() - start} ms`

    context.texture = new three.DataTexture3D(data, ...size)

    context.texture.format = three.RGBFormat
    context.texture.type = three.UnsignedByteType
    context.texture.minFilter = three.LinearFilter
    context.texture.magFilter = three.LinearFilter

    context.texture.needsUpdate = true
}

const createScene = () => {
    const aspect = window.innerWidth / window.innerHeight

    const scene = new three.Scene()
    const camera = new three.PerspectiveCamera(90, aspect, 0.25, 4)

    const light = new three.DirectionalLight(0xffffff, 1)
    light.position.x = 1
    light.position.z = 1
    scene.add(light)
    
    const material = new three.ShaderMaterial({
        vertexShader: require('./shader/volumetric-simple.vs'),
        fragmentShader: require('./shader/volumetric-simple.fs'),
        uniforms: {
            diffuse: { value: context.texture },
            timeOffset: { value: 0 }
        }
    })
    const geometry = new three.SphereGeometry(1, 32, 32)
    const mesh = new three.Mesh( geometry, material )
    scene.add(mesh)

    camera.position.z = 4
    camera.lookAt(0, 0, 0)

    context.scene = scene
    context.camera = camera
    context.material = material
}

const update = time => {
    const {camera} = context

    const factor = (time % 8) / 8

    const yaw = factor * 2 * Math.PI
    const pitch = (30 + 11.25 * Math.sin(factor * 2 * Math.PI)) / 180 * Math.PI
    const dst = (2.5 + 0.25 * Math.sin(factor * 2 * Math.PI))

    camera.position.x = Math.cos(yaw) * Math.cos(pitch) * dst
    camera.position.y = Math.sin(pitch) * dst
    camera.position.z = Math.sin(yaw) * Math.cos(pitch) * dst

    camera.lookAt(0, 0, 0)

    context.material.uniforms.timeOffset.value = (4 * factor) % 1
    context.material.needsUpdate = true
}

const render = () => {
    const {renderer, scene, camera} = context

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.render(scene, camera)
}

const adjustCanvasSize = (renderer) => () => 
    renderer.setSize(window.innerWidth, window.innerHeight)

const animate = timestamp => {
    update(timestamp / 1000)
    render()
    requestAnimationFrame(animate)
}

const main = async () => {
    setup()
    window.onresize = adjustCanvasSize(context.renderer)

    await createTexture()
    createScene()
    animate()
}

window.onload = main