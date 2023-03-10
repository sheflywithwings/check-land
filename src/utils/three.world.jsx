import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'stats-js'
import { assertDefined } from './assert'
import {
  CAMERA_FAR,
  CAMERA_NEAR,
  ENABLE_ORBIT_CONTROLS,
  MAP_Y_NUM,
  MAP_X_NUM,
  VIEW_DISTANCE,
  vec3,
  multiMatrix41,
  matrix41,
  matrix42,
  zVec3,
  color,
  LIGHT_A_HEX,
  LIGHT_B_HEX,
  LIGHT_C_HEX,
  BACK_COLOR,
  FOG_HEX,
  FOG_DENSITY,
  MAP_BACK_HEX,
  PAINT_HEX,
  MAP_UNUSABLE_BACK_HEX,
  MAP_LAYER_Z_INDEX,
  SCALE,
  CHECK_LAYER_Z_INDEX,
  MAP_GAP_PERCENT
} from './constants'
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
    // const cameraFov = 2 * Math.atan(this.mapHeight / (2 * viewDistance)) * (180 / Math.PI) // to fit map to screen height
    // console.log('cameraFov: ', cameraFov)
    const cameraFov = 60
    this.mapLayerZ = Dimension.realFromMeasure(MAP_LAYER_Z_INDEX) * SCALE
    this.checkLayerZ = Dimension.realFromMeasure(CHECK_LAYER_Z_INDEX) * SCALE
    this.rayCastingMeshes = []
    // State vars
    this.isMouseDown = false
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = BACK_COLOR
    this.scene.fog = new THREE.FogExp2(FOG_HEX, FOG_DENSITY)
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
    const diff = Math.max(this.mapWidth, this.mapHeight) / 2
    this.orbitControls.minDistance = cameraNear * 2
    this.orbitControls.maxDistance = cameraFar - diff
    // Map box
    this.unusableInstIds = []
    this.mapBoxInstPositions = []
    this.mapBoxWidth = (this.mapWidth / MAP_X_NUM) * (1 - MAP_GAP_PERCENT)
    this.mapBoxHeight = (this.mapHeight / MAP_Y_NUM) * (1 - MAP_GAP_PERCENT)
    this.mapBoxNum = MAP_X_NUM * MAP_Y_NUM
    const mapBoxMaterial = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      transparent: true,
    })
    this.textureLoader.load('assets/icons/check.svg', texture => {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1, 1)
      mapBoxMaterial.map = texture
      mapBoxMaterial.needsUpdate = true
    })
    this.mapBoxInstMesh = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(this.mapBoxWidth, this.mapBoxHeight),
      mapBoxMaterial,
      this.mapBoxNum,
    )
    this.mapBoxInstMesh.userData.layer = 'map'
    this.scene.add(this.mapBoxInstMesh)
    this.rayCastingMeshes.push(this.mapBoxInstMesh)
    this.setMapBoxMatrix2d()
    // // Check box
    // this.checkedMapBoxInstIds = [0]
    // const checkBoxMaterial = new THREE.MeshStandardMaterial({
    //   side: THREE.DoubleSide,
    //   transparent: true,
    // })
    // this.textureLoader.load('assets/icons/check.svg', texture => {
    //   texture.wrapS = THREE.RepeatWrapping
    //   texture.wrapT = THREE.RepeatWrapping
    //   texture.repeat.set(1, 1)
    //   checkBoxMaterial.map = texture
    //   checkBoxMaterial.needsUpdate = true
    // })
    // this.checkBoxInstMesh = new THREE.InstancedMesh(
    //   new THREE.PlaneGeometry(this.mapBoxWidth, this.mapBoxHeight),
    //   checkBoxMaterial,
    //   this.mapBoxNum,
    // )
    // this.checkBoxInstMesh.userData.layer = 'check'
    // this.scene.add(this.checkBoxInstMesh)
    // this.rayCastingMeshes.push(this.checkBoxInstMesh)
    // this.setCheckBoxMatrix2D()
    // Stats
    this.stats = new Stats()
    domEl.appendChild(this.stats.dom)
    // Animate
    this.animate()
    // Events
    window.addEventListener('resize', this.onWindowResize)
  }

  setMapBoxMatrix2d = () => {
    assertDefined(this.mapBoxInstMesh, this.mapWidth, this.mapHeight, this.mapBoxWidth, this.mapBoxHeight, this.mapBoxNum, this.unusableInstIds, this.mapBoxInstPositions, this.mapLayerZ)
    const mapBoxOutWidth = this.mapBoxWidth / (1 - MAP_GAP_PERCENT)
    const mapBoxOutHeight = this.mapBoxHeight / (1 - MAP_GAP_PERCENT)
    const mapHalfWidth = this.mapWidth / 2
    const mapHalfHeight = this.mapHeight / 2
    for (let i = 0; i < this.mapBoxNum; i++) {
      const x = i % MAP_X_NUM
      const y = (i - x) / MAP_X_NUM
      /* Start to make unusable boxes */
      // if (Math.random() < 0.2) {
      //   this.unusableInstIds.push(i)
      // }
      /* End to make unusable boxes */
      const boxInstPosition = vec3.clone().set(
        -mapHalfWidth + x * mapBoxOutWidth + mapBoxOutWidth / 2,
        mapHalfHeight - y * mapBoxOutHeight - mapBoxOutHeight / 2,
        this.mapLayerZ,
      )
      this.mapBoxInstPositions.push(boxInstPosition)
      this.mapBoxInstMesh.setMatrixAt(
        i,
        multiMatrix41.multiplyMatrices(
          matrix41.setPosition(boxInstPosition),
          matrix42.makeRotationAxis(zVec3, 0),
        )
      )
      if (this.unusableInstIds.indexOf(i) > -1) {
        this.mapBoxInstMesh.setColorAt(i, color.setHex(MAP_UNUSABLE_BACK_HEX))
      } else {
        this.mapBoxInstMesh.setColorAt(i, color.setHex(MAP_BACK_HEX))
      }
    }
    // console.log('this.unusableInstIds: ', this.unusableInstIds)
    // console.log('this.mapBoxInstPositions: ', this.mapBoxInstPositions)
  }

  setCheckBoxMatrix2D = () => {
    assertDefined(this.mapBoxInstPositions, this.mapBoxNum, this.mapBoxWidth, this.mapBoxHeight, this.checkedMapBoxInstIds, this.checkLayerZ)
    for (let i = 0; i < this.mapBoxNum; i++) {
      if (this.checkedMapBoxInstIds.indexOf(i) > -1 && this.mapBoxInstPositions[i]) {
        this.checkBoxInstMesh.setMatrixAt(
          i,
          multiMatrix41.multiplyMatrices(
            matrix41.setPosition(this.mapBoxInstPositions[i].clone().setZ(this.checkLayerZ)),
            matrix42.makeRotationAxis(zVec3, 0),
          )
        )
      }
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
    assertDefined(this.raycaster, this.pointer, this.camera, this.rayCastingMeshes)
    if (!this.isMouseDown) {
      this.intersection = undefined
      return
    }
    const intersections = []
    this.raycaster.setFromCamera(this.pointer, this.camera)
    this.raycaster.intersectObjects(this.rayCastingMeshes, true, intersections)
    if (intersections.length > 0) {
      // console.log('intersections: ', intersections)
      this.intersection = intersections[0]
    } else {
      this.intersection = undefined
    }
  }

  paintSelectedMapBox = () => {
    assertDefined(this.mapBoxInstMesh, this.unusableInstIds)
    if (this.intersection) {
      const layer = this.intersection.object.userData.layer
      if (layer === 'map') {
        const selInstId = this.intersection.instanceId
        if (this.prevSelInstId !== selInstId && this.unusableInstIds.indexOf(selInstId) === -1) {
          this.prevSelInstId = selInstId
          // console.log('selInstId: ', selInstId)
          this.mapBoxInstMesh.setColorAt(selInstId, color.setHex(PAINT_HEX))
          this.mapBoxInstMesh.instanceColor.needsUpdate = true
        }
      }
    }
  }

  checkSelectedMapBox = () => {
    assertDefined(this.checkBoxInstMesh, this.unusableInstIds, this.checkedMapBoxInstIds)
    if (this.intersection) {
      const layer = this.intersection.object.userData.layer
      if (layer === 'map') {
        const selInstId = this.intersection.instanceId
        if (this.checkedMapBoxInstIds.indexOf(selInstId) === -1 && this.unusableInstIds.indexOf(selInstId) === -1) {
          // console.log('selInstId: ', selInstId)
          const newPos = this.mapBoxInstPositions[selInstId].clone().setZ(this.checkLayerZ)
          // console.log('newPos: ', newPos)
          this.checkBoxInstMesh.setMatrixAt(
            selInstId,
            multiMatrix41.multiplyMatrices(
              matrix41.setPosition(newPos),
              matrix42.makeRotationAxis(zVec3, 0),
            )
          )
          this.checkBoxInstMesh.instanceMatrix.needsUpdate = true
        }
      }
    }
  }

  animate = () => {
    assertDefined(this.renderer, this.scene, this.camera, this.mapBoxInstMesh)
    requestAnimationFrame((t) => {
      this.animate()
      this.stats.begin()
      this.renderer.render(this.scene, this.camera)
      this.stats.end()
    })
  }

  onWindowResize = () => {
    assertDefined(this.domEl, this.camera, this.renderer)
    const elRect = this.domEl.getBoundingClientRect()
    this.camera.aspect = elRect.width / elRect.height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(elRect.width, elRect.height)
  }

  onMouseDown = ({ event, tool }) => {
    // console.log('event: ', event)
    // console.log('tool: ', tool)
    assertDefined(event)
    switch (event.button) {
      case 0: // main button (left button)
        this.isMouseDown = true
        this.updateMouseHandlers(event)
        switch (tool) {
          case 'pencil':
            this.paintSelectedMapBox()
            break
          case 'fill':
            break
          case 'check':
            // this.checkSelectedMapBox()
            break
        }
        if (this.intersection) {
          this.orbitControls.enableRotate = false
          this.isOnMap = true
        } else {
          this.orbitControls.enableRotate = ENABLE_ORBIT_CONTROLS
          this.isOnMap = false
        }
        break
      case 1: // wheel button (middle button if present)
        break
      case 2: // secondary button (right button)
        break
      case 3: // fourth button (back button)
        break
      case 4: // fifth button (forward button)
        break
    }
  }

  onMouseMove = ({ event, tool }) => {
    assertDefined(event)
    switch (event.button) {
      case 0: // main button (left button)
        if (this.isMouseDown && this.isOnMap) {
          this.updateMouseHandlers(event)
          switch (tool) {
            case 'pencil':
              this.paintSelectedMapBox()
              break
            case 'fill':
              break
            case 'check':
              // this.checkSelectedMapBox()
              break
          }
        }
        break
      case 1: // wheel button (middle button if present)
        break
      case 2: // secondary button (right button)
        break
      case 3: // fourth button (back button)
        break
      case 4: // fifth button (forward button)
        break
    }
  }

  onMouseUp = ({ event, tool }) => {
    assertDefined(event)
    this.isMouseDown = false
    this.orbitControls.enableRotate = ENABLE_ORBIT_CONTROLS
  }
}
