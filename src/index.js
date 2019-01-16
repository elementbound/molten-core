const _ = require('lodash')
const three = require('three')

const {lerp} = require('./util')

const VoronoiSampler = require('./texture/voronoi')
const LayeredSampler = require('./texture/layered')
const texture = require('./texture')

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
    
    const layerCount = 4
    const size = [256, 256, 64]

    const layers = _.range(layerCount).map(index => {
        const weight = 1 / Math.pow(2, index)
        const scale = lerp(1, 4, index/layerCount)

        const sampler = new VoronoiSampler({
            size: [3.14 * scale, scale, scale],
            seamless: [true, false, true]
        })

        return {
            sampler: sampler,
            weight: weight
        }
    })

    const start = performance.now()
    const data = await texture.render({
        sampler: new LayeredSampler(layers),
        size: size,
        onProgress: progress => {
            let text = `Generating Voronoi texture ${(progress*10000 | 0) / 100}%`
            document.title = `Molten Core - ${progress * 100 | 0}%`
            consoleDiv.innerHTML = text
        }
    })

    consoleDiv.innerHTML = `Generated Voronoi texture in ${performance.now() - start} ms`
    document.title = 'Molten Core'

    context.texture = new three.DataTexture3D(data, ...size)

    context.texture.format = three.RGBFormat
    context.texture.type = three.UnsignedByteType
    context.texture.minFilter = three.LinearFilter
    context.texture.magFilter = three.LinearFilter
    context.texture.wrapS = three.RepeatWrapping
    context.texture.wrapT = three.RepeatWrapping

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