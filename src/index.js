const three = require('three')

const generateVoronoi = (pointCount, width, height, onProgress) => 
    new Promise((resolve, reject) => {
        const worker = new Worker('voronoi.js')
        worker.postMessage([pointCount, width, height])

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
    texture: undefined
}

const setup = () => {
    const renderer = new three.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    context.renderer = renderer
}

const createTexture = async () => {
    const consoleDiv = document.querySelector('.console')
    const width = 256
    const height = 256
    const points = 64

    const start = performance.now()
    const data = await generateVoronoi(points, width, height, progress => {
        let text = `Generating Voronoi texture ${(progress*10000 | 0) / 100}%`
        consoleDiv.innerHTML = text
    })
    consoleDiv.innerHTML = `Generated Voronoi texture in ${performance.now() - start} ms`

    context.texture = new three.DataTexture(data, width, height, three.RGBFormat, three.UnsignedByteType, 
        three.UVMapping, three.RepeatWrapping, three.RepeatWrapping, 
        three.LinearFilter, three.LinearFilter)
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
    
    let geometry = new three.SphereGeometry(1, 32, 32)
    var material = new three.MeshBasicMaterial({ map: context.texture })
    var cube = new three.Mesh( geometry, material )
    scene.add(cube)

    camera.position.z = 4
    camera.lookAt(0, 0, 0)

    context.scene = scene
    context.camera = camera
}

const update = time => {
    const {camera} = context

    const factor = (time % 8) / 8

    const yaw = factor * 2 * Math.PI
    const pitch = (30 + 11.25 * Math.sin(factor * 2 * Math.PI)) / 180 * Math.PI
    const dst = (2 + 0.5 * Math.sin(factor * 2 * Math.PI))

    camera.position.x = Math.cos(yaw) * Math.cos(pitch) * dst
    camera.position.y = Math.sin(pitch) * dst
    camera.position.z = Math.sin(yaw) * Math.cos(pitch) * dst

    camera.lookAt(0, 0, 0)
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