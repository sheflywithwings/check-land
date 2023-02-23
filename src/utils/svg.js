import {
  LoadingManager,
  Group,
  MeshBasicMaterial,
  Color,
  DoubleSide,
  ShapeGeometry,
  Mesh,
  Box3,
} from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { assertDefined } from './assert'

const svgLoadingManager = new LoadingManager()
const svgLoader = new SVGLoader(svgLoadingManager)

/**
 * Generate group using svg file
 *
 * @param {string} url svg file url starting from `public` folder
 * @param {string} fillColor color to fill group
 * @param {string} strokeColor color to draw strokes
 * @param {number} width
 * @param {number} height
 * @param {boolean} drawStrokes
 * @param {boolean} drawFillShapes
 * @param {boolean} strokesWireframe
 * @param {boolean} fillShapesWireframe
 * @return {number} svg based group
 */
export async function getSVGGroup({
  url,
  fillColor,
  strokeColor,
  width = 2,
  height = 0,
  drawStrokes = true,
  drawFillShapes = true,
  strokesWireframe = false,
  fillShapesWireframe = false,
}) {
  assertDefined(url)
  const svgData = await svgLoader.loadAsync(url)
  const paths = svgData.paths
  const group = new Group()
  const svgGroup = new Group()

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i]
    if (!fillColor) {
      fillColor = path.userData.style.fill
    }
    if (!strokeColor) {
      strokeColor = path.userData.style.stroke
    }

    if (drawFillShapes && fillColor !== undefined && fillColor !== 'none') {
      const material = new MeshBasicMaterial({
        color: new Color().setStyle(fillColor).convertSRGBToLinear(),
        opacity: path.userData.style.fillOpacity,
        transparent: true,
        side: DoubleSide,
        // depthWrite: false,
        wireframe: fillShapesWireframe,
      })
      const shapes = SVGLoader.createShapes(path)

      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j]
        const geometry = new ShapeGeometry(shape)
        const mesh = new Mesh(geometry, material)
        group.add(mesh)
      }
    }

    if (drawStrokes && strokeColor !== undefined && strokeColor !== 'none') {
      const material = new MeshBasicMaterial({
        color: new Color().setStyle(strokeColor).convertSRGBToLinear(),
        opacity: path.userData.style.strokeOpacity,
        transparent: true,
        side: DoubleSide,
        // depthWrite: false,
        wireframe: strokesWireframe,
      })

      for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
        const subPath = path.subPaths[j]
        const geometry = SVGLoader.pointsToStroke(subPath.getPoints(), path.userData.style)

        if (geometry) {
          const mesh = new Mesh(geometry, material)
          group.add(mesh)
        }
      }
    }
  }

  const groupBox3 = new Box3()
  groupBox3.setFromObject(group)
  const groupSize = groupBox3.max.sub(groupBox3.min)
  let scaleX = 0
  let scaleY = 0
  if (width) {
    scaleX = width / groupSize.x
  }
  if (height) {
    scaleY = height / groupSize.y
  }
  if (!width) {
    scaleX = scaleY
  }
  if (!height) {
    scaleY = scaleX
  }
  if (!width && !height) {
    scaleX = scaleY = 1
  }
  if (!width) {
    width = scaleX * groupSize.x
  }
  if (!height) {
    height = scaleY * groupSize.y
  }
  group.scale.x = scaleX
  group.scale.y = scaleY
  group.position.x = -width
  group.position.y = height
  group.scale.y *= - 1
  svgGroup.add(group)
  return svgGroup
}
