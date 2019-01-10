const three = require('three')

const context = {
    renderer: undefined,
    scene: undefined,
    camera: undefined
}

const setup = () => {
    const renderer = new three.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

    context.renderer = renderer
}

const createScene = () => {
    const aspect = window.innerWidth / window.innerHeight

    const scene = new three.Scene()
    const camera = new three.PerspectiveCamera(90, aspect, 1, 8)

    const light = new three.DirectionalLight(0xffffff, 1)
    light.position.x = 1
    light.position.z = 1
    scene.add(light)
    
    var geometry = new three.SphereGeometry(1, 32, 32)
    var material = new three.MeshLambertMaterial( { color: 0xffffff } )
    var cube = new three.Mesh( geometry, material )
    scene.add(cube)

    camera.position.z = 4
    camera.lookAt(0, 0, 0)

    context.scene = scene
    context.camera = camera
}

const render = () => {
    const {renderer, scene, camera} = context

    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    
    renderer.render(scene, camera)
}

const adjustCanvasSize = (renderer) => () => 
    renderer.setSize(window.innerWidth, window.innerHeight)

const animate = () => {
    render()
    requestAnimationFrame(animate)
}

window.onload = () => {
    setup()
    window.onresize = adjustCanvasSize(context.renderer)

    createScene()
    animate()
}