import * as THREE from 'three'

let _domEl
let _camera
let _scene
let _renderer
let _clock
let _dataTexture
let _diffuseMap
let _last = 0
let _diffuseMesh

const _raycaster = new THREE.Raycaster()
const _pointer = new THREE.Vector2()
const _position = new THREE.Vector2()
const _color = new THREE.Color()

export const initScene = (domEl) => {
  _domEl = domEl
  console.log('three#app#initScene: domEl: ', domEl)
  const elRect = domEl.getBoundingClientRect()
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
  _diffuseMesh = new THREE.Mesh(geometry, material)
  _scene.add(_diffuseMesh)
  const width = 32
  const height = 32
  const data = new Uint8Array(width * height * 4)
  _dataTexture = new THREE.DataTexture(data, width, height)
  _renderer = new THREE.WebGLRenderer({ antialias: true })
  _renderer.setPixelRatio(window.devicePixelRatio)
  _renderer.setSize(elRect.width, elRect.height)
  console.log('three#app#initScene: _renderer: ', _renderer)
  domEl.appendChild(_renderer.domElement)

  // Events
  window.addEventListener('resize', onWindowResize)
  domEl.addEventListener('mousedown', onMouseDown)
  domEl.addEventListener('mousemove', onMouseMove)
  domEl.addEventListener('mouseup', onMouseUp)
}

const animate = () => {
  requestAnimationFrame(animate)
  const elapsedTime = _clock.getElapsedTime()

  if (elapsedTime - _last > 0.1) {
    _last = elapsedTime
    // _position.x = (32 * THREE.MathUtils.randInt(1, 16)) - 32
    // _position.y = (32 * THREE.MathUtils.randInt(1, 16)) - 32

    // // generate new color data
    // updateDataTexture(_dataTexture)

    // // perform copy from src to dest texture to a random _position
    // _renderer.copyTextureToTexture(_position, _dataTexture, _diffuseMap)
  }

  _renderer.render(_scene, _camera)
}

const updateDataTexture = (texture) => {
  const size = texture.image.width * texture.image.height
  const data = texture.image.data

  // generate a random color and update texture data
  _color.setHex(Math.random() * 0xffffff)

  const r = Math.floor(_color.r * 255)
  const g = Math.floor(_color.g * 255)
  const b = Math.floor(_color.b * 255)

  for (let i = 0; i < size; i++) {
    const stride = i * 4
    data[stride] = r
    data[stride + 1] = g
    data[stride + 2] = b
    data[stride + 3] = 1
  }
}

const onWindowResize = () => {
  if (!_domEl) return
  const _elRect = _domEl.getBoundingClientRect()
  console.log('three#app#onWindowResize: _elRect: ', _elRect)
  _camera.aspect = _elRect.width / _elRect.height
  _camera.updateProjectionMatrix()
  _renderer.setSize(_elRect.width, _elRect.height)
}

const onMouseDown = (event) => {
  if (!_domEl) return
  console.log('three#app#onMouseDown: event: ', event)
  const _intersections = []
  _raycaster.setFromCamera(_pointer, _camera)
  _raycaster.intersectObjects([_diffuseMesh], true, _intersections)
  console.log('three#app#onMouseDown: _intersections: ', _intersections)

  if (_intersections.length > 0) {
    const intersectPoint = _intersections[0].point.clone()
    console.log('three#app#onMouseDown: intersectPoint: ', intersectPoint)
  }
}

const onMouseMove = (event) => {
  if (!_domEl) return
  updatePointer(event)
}

const onMouseUp = (event) => {
  if (!_domEl) return
  console.log('three#app#onMouseUp: event: ', event)
}

const updatePointer = (event) => {
  if (!_domEl) return
  const rect = _domEl.getBoundingClientRect()
  _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1
  // console.log('three#app#updatePointer: _pointer: ', _pointer)
}
