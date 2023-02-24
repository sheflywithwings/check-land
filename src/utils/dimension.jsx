import { assertDefined } from './assert.jsx'
import { floatStrTrim } from './common.jsx'
import { Config } from './config.jsx'
import { DIM_INCH, DIM_FEET, DIM_METER, DIM_CENTIMETER, DIM_MILLIMETER } from './constants'

export class Dimension {
  /**
   * Convert dimension number to real number based on centimeter unit
   *
   * @param measure dimension number to be converted
   * @param unit measure unit
   * @returns float
   */
  static realFromMeasure(measure, unit) {
    if (!unit) unit = Config.getStringValue('dimUnit')
    const scale = Config.getNumericValue('scale')
    assertDefined(measure, unit, scale)
    let real

    switch (unit) {
      case DIM_FEET:
        real = floatStrTrim(measure * 30.480016459203095991 * scale)
        break
      case DIM_INCH:
        real = floatStrTrim(measure * 2.5400013716002578512 * scale)
        break
      case DIM_MILLIMETER:
        real = floatStrTrim(measure * 0.10000005400001014955 * scale)
        break
      case DIM_CENTIMETER:
        real = floatStrTrim(measure * scale)
        break
      case DIM_METER:
        real = floatStrTrim(measure * 100 * scale)
        break
      default:
        real = measure
        break
    }

    return real
  }

  /**
   * Convert real number to dimension number
   *
   * @param real real number to be converted
   * @param unit measure unit
   * @returns float
   */
  static realToMeasure(real, unit) {
    if (!unit) unit = Config.getStringValue('dimUnit')
    const scale = Config.getNumericValue('scale')
    assertDefined(real, unit, scale)
    let dimension

    switch (unit) {
      case DIM_FEET:
        dimension = floatStrTrim((real * 0.032808416666669996953) / scale)
        break
      case DIM_INCH:
        dimension = floatStrTrim((real * 0.3937) / scale)
        break
      case DIM_MILLIMETER:
        dimension = floatStrTrim((real * 10) / scale)
        break
      case DIM_CENTIMETER:
        dimension = floatStrTrim(real / scale)
        break
      case DIM_METER:
        dimension = floatStrTrim((real * 0.01) / scale)
        break
      default:
        dimension = real
        break
    }

    return dimension
  }

  /**
   * Convert pixel number to real number
   *
   * @param pixel pixel number to be converted
   * @returns float
   */
  static pixelToReal(pixel) {
    const scale = Config.getNumericValue('scale')
    assertDefined(pixel, scale)
    return floatStrTrim(pixel * scale)
  }

  /**
   * Convert real number to pixel number
   *
   * @param real real number to be converted
   * @returns float
   */
  static realToPixel(real) {
    const scale = Config.getNumericValue('scale')
    assertDefined(real, scale)
    return floatStrTrim(real / scale)
  }
}
