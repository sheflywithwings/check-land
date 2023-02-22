import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { assertDefined } from './assert'
import { CAMERA_FAR, CAMERA_NEAR, ENABLE_ORBIT_CONTROLS, MAP_Y_NUM, MAP_X_NUM, VIEW_DISTANCE, vec3, multiMatrix41, matrix41, matrix42, zVec3, color, LIGHT_A_HEX, LIGHT_B_HEX, LIGHT_C_HEX, BACK_COLOR, FOG_HEX, FOG_DENSITY } from './constants'
import { Dimension } from './dimension'

export class ThreeWorld {
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  textureLoader = new THREE.TextureLoader()

  constructor({ domEl }) {
    assertDefined(domEl, window)
    this.domEl = domEl
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
      // new THREE.SphereGeometry(this.boxWidth / 2),
      // Todo: Use shader material later
      new THREE.MeshStandardMaterial({
        color: 'white',
        side: THREE.DoubleSide,
      }),
      this.boxNum,
    )
    this.setBoxMatrix2d()
    // scene
    this.scene = new THREE.Scene()
    this.scene.background = BACK_COLOR
    this.scene.fog = new THREE.FogExp2(FOG_HEX, FOG_DENSITY)
    this.scene.add(this.boxInstMesh)
    // Lights
    const lightA = new THREE.DirectionalLight(LIGHT_A_HEX)
    lightA.position.set(1, 1, 1)
    this.scene.add(lightA)
    const lightB = new THREE.DirectionalLight(LIGHT_B_HEX)
    lightB.position.set(-1, -1, -1)
    this.scene.add(lightB)
    const lightC = new THREE.AmbientLight(LIGHT_C_HEX)
    this.scene.add(lightC)
    // Camera
    this.camera = new THREE.PerspectiveCamera(cameraFov, elRect.width / elRect.height, cameraNear, cameraFar)
    this.camera.position.z = viewDistance
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(elRect.width, elRect.height)
    this.renderer.shadowMap.enabled = false
    this.renderer.outputEncoding = THREE.sRGBEncoding
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
            -mapHalfWidth + x * this.boxWidth + this.boxWidth / 2,
            mapHalfHeight - y * this.boxHeight - this.boxHeight / 2,
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
      this.intersection = undefined
      return
    }
    const intersections = []
    this.raycaster.setFromCamera(this.pointer, this.camera)
    this.raycaster.intersectObjects([this.boxInstMesh], true, intersections)
    if (intersections.length > 0) {
      // console.log('utils#three.world#updateIntersectPoint: intersections: ', intersections)
      this.intersection = intersections[0]
    } else {
      this.intersection = undefined
    }
  }

  paintSelectedBox = () => {
    assertDefined(this.boxInstMesh)
    if (this.intersection) {
      const selInstanceId = this.intersection.instanceId
      if (this.prevSelInstanceId !== selInstanceId) {
        this.prevSelInstanceId = selInstanceId
        console.log(selInstanceId)
        this.boxInstMesh.setColorAt(selInstanceId, color.setHex(0xff0000))
        this.boxInstMesh.instanceColor.needsUpdate = true
      }
    }
  }

  animate = () => {
    assertDefined(this.renderer, this.scene, this.camera, this.boxInstMesh)
    requestAnimationFrame((t) => {
      this.animate()
      this.renderer.render(this.scene, this.camera)
    })
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
    this.paintSelectedBox()
    if (this.intersection) {
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
      this.paintSelectedBox()
    }
  }

  onMouseUp = (event) => {
    assertDefined(event)
    this.isMouseDown = false
    this.orbitControls.enableRotate = ENABLE_ORBIT_CONTROLS
  }
}
