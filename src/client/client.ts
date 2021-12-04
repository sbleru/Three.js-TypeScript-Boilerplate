import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const scene = new THREE.Scene()

/**
 * Prepare camera.
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

/**
 * Prepare render element.
 */
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

/**
 * Create orbit control
 */
const controls = new OrbitControls(camera, renderer.domElement)

/**
 * Create model to render.
 */
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
})
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

/**
 * Re-render if window resized.
 */
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

/**
 * Create animation from animation clip.
 */
const duration = 4
const clipJSON = {
    duration: duration,
    tracks: [
        {
            name: '.rotation[x]',
            type: 'number',
            times: [0, duration],
            values: [0, 2 * Math.PI],
            interpolation: THREE.InterpolateLinear,
        },
        {
            name: '.rotation[y]',
            type: 'number',
            times: [0, duration],
            values: [0, 2 * Math.PI],
            interpolation: THREE.InterpolateLinear,
        },
    ],
}
const clip = THREE.AnimationClip.parse(clipJSON)
const mixer = new THREE.AnimationMixer(cube)
const action = mixer.clipAction(clip)
action.play()

/**
 * Animate and render.
 */
function animate() {
    requestAnimationFrame(animate)

    mixer.update(0.01)

    controls.update()

    render()
}

/**
 * Render scene.
 */
function render() {
    renderer.render(scene, camera)
}

/**
 * Trigger a world.
 */
animate()
