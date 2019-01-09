const three = require('three')

const setupCanvas = (root) => {
    const canvas = document.createElement('canvas')
    root.appendChild(canvas)
}

window.onload = () => 
    setupCanvas(document.querySelector('body'))