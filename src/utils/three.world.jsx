import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { assertDefined } from './assert'
import { CAMERA_FAR, CAMERA_NEAR, ENABLE_ORBIT_CONTROLS, MAP_Y_NUM, MAP_X_NUM, VIEW_DISTANCE, vec3, multiMatrix41, matrix41, matrix42, zVec3 } from './constants'
import { Dimension } from './dimension'

export class ThreeWorld {
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  color = new THREE.Color()
  clock = new THREE.Clock()
  textureLoader = new THREE.TextureLoader()
  last = this.clock.getElapsedTime()

  constructor({ domEl }) {
    assertDefined(domEl, window)
    // Reference vars
    const elRect = domEl.getBoundingClientRect()
    const cameraNear = Dimension.realFromMeasure(CAMERA_NEAR)
    const cameraFar = Dimension.realFromMeasure(CAMERA_FAR)
    const viewDistance = Dimension.realFromMeasure(VIEW_DISTANCE)
    this.mapWidth = Dimension.realFromMeasure(MAP_X_NUM)
    this.mapHeight = Dimension.realFromMeasure(MAP_Y_NUM)
    const cameraFov = 2 * Math.atan(this.mapHeight / (2 * viewDistance)) * (180 / Math.PI) + 2
    console.log('utils#three.world#constructor: cameraFov: ', cameraFov)
    // State vars
    this.isMouseDown = false
    // Check box
    this.boxWidth = this.mapWidth / MAP_X_NUM
    this.boxHeight = this.mapHeight / MAP_Y_NUM
    this.boxNum = MAP_X_NUM * MAP_Y_NUM
    this.boxInstMesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(this.boxWidth, this.boxHeight),
      // Todo: Use shader material later
      new THREE.MeshBasicMaterial({
        color: 'gray',
        side: THREE.DoubleSide,
      }),
      this.boxNum,
    )
    this.setBoxMatrix2d()
    // Init scene
    this.camera = new THREE.PerspectiveCamera(cameraFov, elRect.width / elRect.height, cameraNear, cameraFar)
    this.camera.position.z = viewDistance
    this.scene = new THREE.Scene()
    this.scene.add(this.boxInstMesh)
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(elRect.width, elRect.height)
    this.domEl = domEl
    domEl.appendChild(this.renderer.domElement)
    // Orbit Controls
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement)
    // Animate
    this.animate()
    // Events
    window.addEventListener('resize', this.onWindowResize)
    domEl.addEventListener('mousedown', this.onMouseDown)
    domEl.addEventListener('mousemove', this.onMouseMove)
    domEl.addEventListener('mouseup', this.onMouseUp)
  }

  setBoxMatrix2d = () => {
    assertDefined(this.boxInstMesh, this.mapWidth, this.mapHeight, this.boxWidth, this.boxHeight, this.boxNum)
    const mapHalfWidth = this.mapWidth / 2
    const mapHalfHeight = this.mapHeight / 2
    for (let i = 0; i < this.boxNum; i++) {
      const x = i % MAP_X_NUM
      const y = (i - x) / MAP_X_NUM
      this.boxInstMesh.setMatrixAt(
        i,
        multiMatrix41.multiplyMatrices(
          matrix41.setPosition(vec3.clone().set(
            -mapHalfWidth + x * this.boxWidth,
            mapHalfHeight - y * this.boxHeight,
            0
          )),
          matrix42.makeRotationAxis(zVec3, 0),
        )
      )
    }
  }

  updateMouseHandlers = (event) => {
    assertDefined(event, this.updatePointer, this.updateIntersectPoint)
    this.updatePointer(event)
    this.updateIntersectPoint()
  }

  updatePointer = (event) => {
    assertDefined(event, this.domEl, this.pointer)
    const rect = this.domEl.getBoundingClientRect()
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1
  }

  updateIntersectPoint = () => {
    assertDefined(this.raycaster, this.pointer, this.camera, this.boxInstMesh)
    if (!this.isMouseDown) {
      this.intersectPoint = undefined
      return
    }
    const intersections = []
    this.raycaster.setFromCamera(this.pointer, this.camera)
    this.raycaster.intersectObjects([this.boxInstMesh], true, intersections)
    if (intersections.length > 0) {
      console.log('utils#three.world#updateIntersectPoint: intersections: ', intersections)
      this.intersectPoint = intersections[0].point.clone()
    } else {
      this.intersectPoint = undefined
    }
  }

  animate = () => {
    assertDefined(this.clock, this.last, this.renderer, this.scene, this.camera, this.boxInstMesh)
    requestAnimationFrame(this.animate)
    const elapsedTime = this.clock.getElapsedTime()
    if (elapsedTime - this.last > 0.1) {
      this.last = elapsedTime
    }
    this.renderer.render(this.scene, this.camera)
  }

  onWindowResize = () => {
    assertDefined(this.domEl, this.camera, this.renderer)
    const elRect = this.domEl.getBoundingClientRect()
    this.camera.aspect = elRect.width / elRect.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(elRect.width, elRect.height)
  }

  onMouseDown = (event) => {
    assertDefined(event)
    this.isMouseDown = true
    this.updateMouseHandlers(event)
    if (this.intersectPoint) {
      this.orbitControls.enableRotate = false
      this.isOnMap = true
    } else {
      this.orbitControls.enableRotate = ENABLE_ORBIT_CONTROLS
      this.isOnMap = false
    }
  }

  onMouseMove = (event) => {
    assertDefined(event)
    if (this.isMouseDown && this.isOnMap) {
      this.updateMouseHandlers(event)
    }
  }

  onMouseUp = (event) => {
    assertDefined(event)
    this.isMouseDown = false
    this.orbitControls.enableRotate = ENABLE_ORBIT_CONTROLS
  }
}
