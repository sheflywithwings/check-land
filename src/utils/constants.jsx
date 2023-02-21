import * as THREE from 'three'

export const DIM_INCH = 'inch'
export const DIM_FEET = 'ft'
export const DIM_METER = 'm'
export const DIM_CENTIMETER = 'cm'
export const DIM_MILLIMETER = 'mm'

export const FLOAT_DIGITS = 3

export const MAP_WIDTH = 5000
export const MAP_HEIGHT = 2500
export const SCALE = 0.001
export const VIEW_DISTANCE = MAP_WIDTH
export const CAMERA_NEAR = 0.01 / SCALE
export const CAMERA_FAR = MAP_WIDTH * 2
export const ENABLE_ORBIT_CONTROLS = false

export const vec3 = new THREE.Vector3()
export const xVec3 = new THREE.Vector3(1, 0, 0)
export const yVec3 = new THREE.Vector3(0, 1, 0)
export const zVec3 = new THREE.Vector3(0, 0, 1)

export const multiMatrix41 = new THREE.Matrix4()
export const matrix41 = new THREE.Matrix4()
export const matrix42 = new THREE.Matrix4()
