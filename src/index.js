const three = require('three')
const shader = require('./shader')
const voronoi = require('./gpu-voronoi')
const { lerp } = require('./util')

const context = {
    renderer: undefined,
    scene: undefined,
    camera: undefined,
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

const createScene = async () => {
    const aspect = window.innerWidth / window.innerHeight

    const scene = new three.Scene()
    /*
    const camera = new three.PerspectiveCamera(90, aspect, 0.25, 8)
    camera.position.z = 4
    camera.lookAt(0, 0, 0)
    scene.add(camera)
    /*/
    const camera = new three.OrthographicCamera(-1, -1, 1, 1, 0.5, 32)
    camera.position = new three.Vector3(0, 0, 4)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    scene.add(camera)
    //*/

    const light = new three.DirectionalLight(0xffffff, 1)
    light.position.x = 1
    light.position.z = 1
    scene.add(light)

    const vertexShader = shader.processSource(require('./shader/volumetric-simple.vs'))
    const fragmentShader = shader.processSource(require('./shader/volumetric-simple.fs'))
    
    const textureSize = [8, 8, 8]// [1024, 1024, 128]
    const textureData = new Uint8Array(textureSize.reduce((a, b) => a * b, 1) * 4)// await voronoi.render(textureSize)
    const texture = new three.DataTexture3D(textureData, ...textureSize)
    texture.format = three.RGBAFormat
    texture.type = three.UnsignedByteType
    texture.minFilter = three.LinearFilter
    texture.magFilter = three.LinearFilter
    texture.wrapS = three.RepeatWrapping
    texture.wrapT = three.RepeatWrapping
    texture.needsUpdate = true

    const material = new three.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            timeOffset: { value: 0 },
            offsetPower: { value: 0.5}
        }
    })
    
    /* const geometry = new three.SphereGeometry(1, 128, 128)
    const mesh = new three.Mesh( geometry, material )
    scene.add(mesh) */
    const geometry = new three.SphereGeometry(1)// new three.PlaneGeometry(2, 2)
    const mesh = new three.Mesh(geometry, material)
    scene.add(mesh)

    context.scene = scene
    context.camera = camera
    context.material = material
}

const update = time => {
    const {camera} = context

    const factor = (time % 8) / 8

    /*const yaw = factor * 2 * Math.PI
    const pitch = (30 + 11.25 * Math.sin(factor * 2 * Math.PI)) / 180 * Math.PI
    const dst = (2.5 + 0.25 * Math.sin(factor * 2 * Math.PI)) * 1.15

    camera.position.x = Math.cos(yaw) * Math.cos(pitch) * dst
    camera.position.y = Math.sin(pitch) * dst
    camera.position.z = Math.sin(yaw) * Math.cos(pitch) * dst

    camera.lookAt(0, 0, 0)*/

    context.material.uniforms.timeOffset.value = (2 * factor) % 1
    context.material.uniforms.offsetPower.value = lerp(-0.25, 0.5, (1 + Math.sin(factor * 2 * Math.PI)))
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

    await createScene()
    animate()
}

window.onload = main