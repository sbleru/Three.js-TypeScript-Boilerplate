import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'

const scene = new THREE.Scene()

const loader = new GLTFLoader()
const flamingo = await loader.loadAsync('./assets/Flamingo.glb')

function setupModel(data: GLTF) {
    console.info(data)
    const model = data.scene.children[0]
    const clip = data.animations[0]
    console.info(clip)
    const mixer = new THREE.AnimationMixer(model)
    const action = mixer.clipAction(clip)
    action.play()
    ;(
        model as THREE.Object3D<THREE.Event> & {
            tick: (delta: any) => THREE.AnimationMixer
        }
    ).tick = (delta) => mixer.update(delta)
    return model
}
const Mflamingo = setupModel(flamingo);
scene.add(Mflamingo)
const clipFlamingo = flamingo.animations[0]
const mixerFlamingo = new THREE.AnimationMixer(Mflamingo)
const actionFlamingo = mixerFlamingo.clipAction(clipFlamingo)
actionFlamingo.play();

/**
 * Prepare camera.
 */
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 2

/**
 * Add light.
 */
const ambientLight = new THREE.AmbientLight(0x444444);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xaaaaaa, 0.9);
directionalLight.position.set(0, 100, 40);
scene.add(directionalLight);

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
const clock = new THREE.Clock()

const exporter = new GLTFExporter();

/**
 * Animate and render.
 */
function animate() {
    requestAnimationFrame(animate)

    const delta = clock.getDelta()
    mixer.update(delta)
    mixerFlamingo.update(delta);
    controls.update()
    // console.info(Mflamingo);

    exporter.parse(
        Mflamingo,
        (gltf) => {
            // このgltfデータをサーバー経由で送ってレンダリングを行えれば良さそう
            // ただし、gltfのフルデータになるので、本当はアニメーションデータだけ送りたい
            // そうしないと、レンダリング側でgltfのnewを繰り返すことになる。それでアニメーションってできるのか？
            // Animation System使わないことになるけど。
            // modelの位置からAnimationClipのkeyframetrackを生成できれば良さそう
            // meshes.wheightsの値だけが変わっていってそう
            // 
            // console.info(gltf);
        },
        {
            // binary: true,
            // animations: [clipFlamingo]
        }
    )

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
