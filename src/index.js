const three = require('three')
const shader = require('./shader')
const JSZip = require('jszip')
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
    const renderer = new three.WebGLRenderer( { canvas: canvas, context: renderContext, antialias: true } )

    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    context.renderer = renderer
}

const createScene = () => {
    const { renderer } = context
    const canvas = renderer.domElement
    const aspect = canvas.width / canvas.height

    const scene = new three.Scene()
    const camera = new three.PerspectiveCamera(90, aspect, 0.25, 8)

    const light = new three.DirectionalLight(0xffffff, 1)
    light.position.x = 1
    light.position.z = 1
    scene.add(light)

    const vertexShader = shader.processSource(require('./shader/volumetric-procedural.vs'))
    const fragmentShader = shader.processSource(require('./shader/volumetric-procedural.fs'))
    
    const material = new three.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: {
            timeOffset: { value: 0 },
            offsetPower: { value: 0.5}
        }
    })
    const geometry = new three.SphereGeometry(1, 512, 512)
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
    const dst = (2.5 + 0.25 * Math.sin(factor * 2 * Math.PI)) * 1.15

    camera.position.x = Math.cos(yaw) * Math.cos(pitch) * dst
    camera.position.y = Math.sin(pitch) * dst
    camera.position.z = Math.sin(yaw) * Math.cos(pitch) * dst

    camera.lookAt(0, 0, 0)

    context.material.uniforms.timeOffset.value = (2 * factor) % 1
    context.material.uniforms.offsetPower.value = lerp(-0.25, 0.5, (1 + Math.sin(factor * 2 * Math.PI)))
    context.material.needsUpdate = true
}

const render = () => {
    const {renderer, scene, camera} = context

    const canvas = renderer.domElement
    camera.aspect = canvas.width / canvas.height
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

    createScene()
    animate()
}

/**
 * Retrieve canvas contents as blob
 * 
 * @param {HTMLCanvasElement} canvas 
 */
const canvasToBlob = canvas => 
    new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
    })

const saveData = (blob, fileName) => {
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'

    const url = window.URL.createObjectURL(blob)
    console.log('Navigating to URL', url)

    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
}

const displayProgress = progress => {
    const progressbar = document.querySelector('.progressbar')
    const percent = progressbar.querySelector('.percent')

    percent.style.width = `${progress * 100 | 0}%`
    progressbar.style.display = 'block'
}

const hideProgress = () => {
    const progressbar = document.querySelector('.progressbar')
    progressbar.style.display = 'none'
}

const renderSequence = async () => {
    setup()
    // window.onresize = adjustCanvasSize(context.renderer)
    const renderer = context.renderer
    renderer.setSize(600, 600)

    const canvas = renderer.domElement

    createScene()

    const zip = new JSZip()

    const duration = 8
    const fps = 24

    for(let frame = 0; frame < duration * fps; frame++) {
        update(frame / fps)
        render()

        const frameBlob = await canvasToBlob(canvas)
        zip.file(`${frame}.png`, frameBlob)
        displayProgress(frame / (duration * fps))
    }

    displayProgress(1)
    zip.generateAsync({ type: 'blob' }).then(zipBlob => {
        saveData(zipBlob, 'molten-core.zip')
        hideProgress()
    })
}

window.onload = renderSequence