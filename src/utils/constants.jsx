import * as THREE from 'three'

export const DIM_INCH = 'inch'
export const DIM_FEET = 'ft'
export const DIM_METER = 'm'
export const DIM_CENTIMETER = 'cm'
export const DIM_MILLIMETER = 'mm'

export const FLOAT_DIGITS = 10

export const MAP_X_NUM = 100 // max: 1000
export const MAP_Y_NUM = 50 // max: 500
export const SCALE = 0.00001
export const VIEW_DISTANCE = MAP_X_NUM / 3
export const CAMERA_NEAR = 1
export const CAMERA_FAR = MAP_X_NUM * 4
export const ENABLE_ORBIT_CONTROLS = true
export const MAP_GAP_PERCENT = 0.01 // range: 0 ~ 1

export const MAP_LAYER_Z_INDEX = 0
export const CHECK_LAYER_Z_INDEX = 1

export const LIGHT_A_HEX = 0xffffff
export const LIGHT_B_HEX = 0x002288
export const LIGHT_C_HEX = 0x222222
export const FOG_HEX = 0x001f3f
export const FOG_DENSITY = 0.002
export const MAP_BACK_HEX = 0x111111
export const MAP_UNUSABLE_BACK_HEX = 0xff0000
export const PAINT_HEX = 0x00ff00

export const BACK_COLOR = new THREE.Color(0x666666)

export const vec3 = new THREE.Vector3()
export const xVec3 = new THREE.Vector3(1, 0, 0)
export const yVec3 = new THREE.Vector3(0, 1, 0)
export const zVec3 = new THREE.Vector3(0, 0, 1)

export const multiMatrix41 = new THREE.Matrix4()
export const matrix41 = new THREE.Matrix4()
export const matrix42 = new THREE.Matrix4()

export const color = new THREE.Color()
