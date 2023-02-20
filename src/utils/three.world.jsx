import * as THREE from 'three'

export class ThreeWorld {
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  position = new THREE.Vector2()
  color = new THREE.Color()
  clock = new THREE.Clock()
  last = this.clock.getElapsedTime()
  textureLoader = new THREE.TextureLoader()

  constructor({ domEl }) {
    this.domEl = domEl
    console.log('utils#three.world#constructor: domEl: ', domEl)
    const elRect = domEl.getBoundingClientRect()
    console.log('utils#three.world#constructor: elRect: ', elRect)
    this.camera = new THREE.PerspectiveCamera(70, elRect.width / elRect.height, 0.01, 10)
    this.camera.position.z = 2
    this.scene = new THREE.Scene()
    this.diffuseMap = this.textureLoader.load('assets/images/FloorsCheckerboard_S_Diffuse.jpg', this.animate)
    this.diffuseMap.wrapS = this.diffuseMap.wrapT = THREE.RepeatWrapping
    this.diffuseMap.minFilter = THREE.LinearFilter
    this.diffuseMap.repeat.set(2, 1) // temp
    this.diffuseMap.generateMipmaps = false
    const geometry = new THREE.PlaneGeometry(4, 2)
    const material = new THREE.MeshBasicMaterial({ map: this.diffuseMap })
    this.diffuseMesh = new THREE.Mesh(geometry, material)
    this.scene.add(this.diffuseMesh)
    const width = 32
    const height = 32
    const data = new Uint8Array(width * height * 4)
    this.dataTexture = new THREE.DataTexture(data, width, height)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(elRect.width, elRect.height)
    console.log('utils#three.world#constructor: renderer: ', this.renderer)
    domEl.appendChild(this.renderer.domElement)

    // Events
    window.addEventListener('resize', this.onWindowResize)
    domEl.addEventListener('mousedown', this.onMouseDown)
    domEl.addEventListener('mousemove', this.onMouseMove)
    domEl.addEventListener('mouseup', this.onMouseUp)
  }

  animate = () => {
    requestAnimationFrame(this.animate)
    const elapsedTime = this.clock.getElapsedTime()

    if (elapsedTime - this.last > 0.1) {
      this.last = elapsedTime
      // position.x = (32 * THREE.MathUtils.randInt(1, 16)) - 32
      // position.y = (32 * THREE.MathUtils.randInt(1, 16)) - 32

      // // generate new color data
      // updateDataTexture(dataTexture)

      // // perform copy from src to dest texture to a random position
      // renderer.copyTextureToTexture(position, dataTexture, diffuseMap)
    }

    this.renderer.render(this.scene, this.camera)
  }

  updateDataTexture = (texture) => {
    const size = texture.image.width * texture.image.height
    const data = texture.image.data

    // generate a random color and update texture data
    this.color.setHex(Math.random() * 0xffffff)

    const r = Math.floor(this.color.r * 255)
    const g = Math.floor(this.color.g * 255)
    const b = Math.floor(this.color.b * 255)

    for (let i = 0; i < size; i++) {
      const stride = i * 4
      data[stride] = r
      data[stride + 1] = g
      data[stride + 2] = b
      data[stride + 3] = 1
    }
  }

  onWindowResize = () => {
    if (!this.domEl) return
    const _elRect = this.domEl.getBoundingClientRect()
    console.log('utils#three.world#onWindowResize: _elRect: ', _elRect)
    this.camera.aspect = _elRect.width / _elRect.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(_elRect.width, _elRect.height)
  }

  onMouseDown = (event) => {
    if (!this.domEl) return
    console.log('utils#three.world#onMouseDown: event: ', event)
    const _intersections = []
    this.raycaster.setFromCamera(this.pointer, this.camera)
    this.raycaster.intersectObjects([this.diffuseMesh], true, _intersections)
    console.log('utils#three.world#onMouseDown: _intersections: ', _intersections)

    if (_intersections.length > 0) {
      const intersectPoint = _intersections[0].point.clone()
      console.log('utils#three.world#onMouseDown: intersectPoint: ', intersectPoint)
    }
  }

  onMouseMove = (event) => {
    if (!this.domEl) return
    this.updatePointer(event)
  }

  onMouseUp = (event) => {
    if (!this.domEl) return
    console.log('utils#three.world#onMouseUp: event: ', event)
  }

  updatePointer = (event) => {
    if (!this.domEl) return
    const rect = this.domEl.getBoundingClientRect()
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1
    // console.log('utils#three.world#updatePointer: pointer: ', pointer)
  }
}
