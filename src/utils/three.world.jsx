import * as THREE from 'three'
import { assertDefined } from './assert'
import { CAMERA_FAR, CAMERA_NEAR, MAP_HEIGHT, MAP_WIDTH, VIEW_DISTANCE } from './constants'
import { Dimension } from './dimension'

export class ThreeWorld {
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  position = new THREE.Vector2()
  color = new THREE.Color()
  clock = new THREE.Clock()
  last = this.clock.getElapsedTime()
  textureLoader = new THREE.TextureLoader()

  constructor({ domEl }) {
    // Basic vars
    const elRect = domEl.getBoundingClientRect()
    const cameraNear = Dimension.realFromMeasure(CAMERA_NEAR)
    const cameraFar = Dimension.realFromMeasure(CAMERA_FAR)
    const viewDistance = Dimension.realFromMeasure(VIEW_DISTANCE)
    const mapWidth = Dimension.realFromMeasure(MAP_WIDTH)
    const mapHeight = Dimension.realFromMeasure(MAP_HEIGHT)
    const cameraFov = 2 * Math.atan(mapHeight / (2 * viewDistance)) * (180 / Math.PI)

    // Map
    this.diffuseMap = this.textureLoader.load('assets/images/FloorsCheckerboard_S_Diffuse.jpg', this.animate)
    this.diffuseMap.wrapS = this.diffuseMap.wrapT = THREE.RepeatWrapping
    this.diffuseMap.minFilter = THREE.LinearFilter
    this.diffuseMap.repeat.set(mapWidth / mapHeight, 1)
    this.diffuseMap.generateMipmaps = false
    const geometry = new THREE.PlaneGeometry(mapWidth, mapHeight)
    const material = new THREE.MeshBasicMaterial({ map: this.diffuseMap })
    this.diffuseMesh = new THREE.Mesh(geometry, material)

    // Dynamic sub texture
    const width = 32
    const height = 32
    const data = new Uint8Array(width * height * 4)
    this.dataTexture = new THREE.DataTexture(data, width, height)

    // Init scene
    this.camera = new THREE.PerspectiveCamera(cameraFov, elRect.width / elRect.height, cameraNear, cameraFar)
    this.camera.position.z = viewDistance
    this.scene = new THREE.Scene()
    this.scene.add(this.diffuseMesh)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(elRect.width, elRect.height)
    this.domEl = domEl
    domEl.appendChild(this.renderer.domElement)

    // Events
    window.addEventListener('resize', this.onWindowResize)
    domEl.addEventListener('mousedown', this.onMouseDown)
    domEl.addEventListener('mousemove', this.onMouseMove)
    domEl.addEventListener('mouseup', this.onMouseUp)
  }

  animate = () => {
    assertDefined(this.clock, this.last, this.renderer, this.scene, this.camera, this.position, this.dataTexture, this.diffuseMap, this.updateDataTexture)
    requestAnimationFrame(this.animate)
    const elapsedTime = this.clock.getElapsedTime()

    if (elapsedTime - this.last > 0.1) {
      this.last = elapsedTime
      // this.position.x = (32 * THREE.MathUtils.randInt(1, 16)) - 32
      // this.position.y = (32 * THREE.MathUtils.randInt(1, 16)) - 32

      // // generate new color data
      // this.updateDataTexture()

      // // perform copy from src to dest texture to a random position
      // this.renderer.copyTextureToTexture(this.position, this.dataTexture, this.diffuseMap)
    }

    this.renderer.render(this.scene, this.camera)
  }

  updateDataTexture = () => {
    assertDefined(this.dataTexture, this.color)
    const size = this.dataTexture.image.width * this.dataTexture.image.height
    const data = this.dataTexture.image.data

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
    assertDefined(this.domEl, this.camera, this.renderer)
    const elRect = this.domEl.getBoundingClientRect()
    this.camera.aspect = elRect.width / elRect.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(elRect.width, elRect.height)
  }

  onMouseDown = (event) => {
    assertDefined(this.domEl, this.raycaster, this.pointer, this.camera, this.diffuseMesh)
    // console.log('utils#three.world#onMouseDown: event: ', event)
    const _intersections = []
    this.raycaster.setFromCamera(this.pointer, this.camera)
    this.raycaster.intersectObjects([this.diffuseMesh], true, _intersections)
    // console.log('utils#three.world#onMouseDown: _intersections: ', _intersections)

    if (_intersections.length > 0) {
      const intersectPoint = _intersections[0].point.clone()
      // console.log('utils#three.world#onMouseDown: intersectPoint: ', intersectPoint)
    }
  }

  onMouseMove = (event) => {
    assertDefined(this.domEl)
    this.updatePointer(event)
  }

  onMouseUp = (event) => {
    assertDefined(this.domEl)
    // console.log('utils#three.world#onMouseUp: event: ', event)
  }

  updatePointer = (event) => {
    assertDefined(this.domEl, this.pointer)
    const rect = this.domEl.getBoundingClientRect()
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1
  }
}
