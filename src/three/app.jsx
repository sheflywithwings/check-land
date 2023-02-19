import * as THREE from 'three'

let _el
let _camera
let _scene
let _renderer
let _clock
let _dataTexture
let _diffuseMap
let last = 0

const position = new THREE.Vector2()
const color = new THREE.Color()

export const initScene = (el) => {
  _el = el
  console.log('three#app#initScene: el: ', el)
  const elRect = el.getBoundingClientRect()
  console.log('three#app#initScene: elRect: ', elRect)
  _camera = new THREE.PerspectiveCamera(70, elRect.width / elRect.height, 0.01, 10)
  _camera.position.z = 2
  _scene = new THREE.Scene()
  _clock = new THREE.Clock()
  const loader = new THREE.TextureLoader()
  _diffuseMap = loader.load('assets/images/FloorsCheckerboard_S_Diffuse.jpg', animate)
  _diffuseMap.wrapS = _diffuseMap.wrapT = THREE.RepeatWrapping
  _diffuseMap.minFilter = THREE.LinearFilter
  _diffuseMap.repeat.set(2, 1) // temp
  _diffuseMap.generateMipmaps = false
  const geometry = new THREE.PlaneGeometry(4, 2)
  const material = new THREE.MeshBasicMaterial({ map: _diffuseMap })
  const mesh = new THREE.Mesh(geometry, material)
  _scene.add(mesh)
  const width = 32
  const height = 32
  const data = new Uint8Array(width * height * 4)
  _dataTexture = new THREE.DataTexture(data, width, height)
  _renderer = new THREE.WebGLRenderer({ antialias: true })
  _renderer.setPixelRatio(window.devicePixelRatio)
  _renderer.setSize(elRect.width, elRect.height)
  el.appendChild(_renderer.domElement)
  window.addEventListener('resize', onWindowResize)
}

export const onWindowResize = (e) => {
  if (_el) {
    const _elRect = _el.getBoundingClientRect()
    console.log('three#app#onWindowResize: _elRect: ', _elRect)
    _camera.aspect = _elRect.width / _elRect.height
    _camera.updateProjectionMatrix()
    _renderer.setSize(_elRect.width, _elRect.height)
  }
}

export const animate = () => {
  requestAnimationFrame(animate)
  const elapsedTime = _clock.getElapsedTime()

  if (elapsedTime - last > 0.1) {
    last = elapsedTime
    // position.x = (32 * THREE.MathUtils.randInt(1, 16)) - 32
    // position.y = (32 * THREE.MathUtils.randInt(1, 16)) - 32

    // // generate new color data
    // updateDataTexture(_dataTexture)

    // // perform copy from src to dest texture to a random position
    // _renderer.copyTextureToTexture(position, _dataTexture, _diffuseMap)
  }

  _renderer.render(_scene, _camera)
}

export const updateDataTexture = (texture) => {
  const size = texture.image.width * texture.image.height
  const data = texture.image.data

  // generate a random color and update texture data
  color.setHex(Math.random() * 0xffffff)

  const r = Math.floor(color.r * 255)
  const g = Math.floor(color.g * 255)
  const b = Math.floor(color.b * 255)

  for (let i = 0; i < size; i++) {
    const stride = i * 4
    data[stride] = r
    data[stride + 1] = g
    data[stride + 2] = b
    data[stride + 3] = 1
  }
}
