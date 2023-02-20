import { assertDefined } from './assert.jsx'
import { Config } from './config.jsx'
import { DIM_INCH, DIM_FEET, DIM_METER, DIM_CENTIMETER, DIM_MILLIMETER } from './constants'

const decimals = 1000

export class Dimension {
  static round(value) {
    assertDefined(value)
    return Math.round(decimals * value) / decimals
  }

  /**
   * Convert dimension number to real number based on centimeter unit
   *
   * @param measure dimension number to be converted
   * @param unit measure unit
   * @returns float
   */
  static fromMeasure(measure, unit) {
    if (!unit) unit = Config.getStringValue('dimUnit')
    console.log('utils#dimension#cmFromMeasure: unit: ', unit)
    const scale = Config.getNumericValue('scale')
    assertDefined(measure, unit, scale)

    switch (unit) {
      case DIM_FEET:
        return Dimension.round(measure * 30.480016459203095991 * scale)
      case DIM_INCH:
        return Dimension.round(measure * 2.5400013716002578512 * scale)
      case DIM_MILLIMETER:
        return Dimension.round(measure * 0.10000005400001014955 * scale)
      case DIM_CENTIMETER:
        return Dimension.round(measure * scale)
      case DIM_METER:
        return Dimension.round(measure * 100 * scale)
      default:
        return measure
    }
  }

  /**
   * Convert real number to dimension number
   *
   * @param real real number to be converted
   * @param unit measure unit
   * @returns float
   */
  static toMeasure(real, unit) {
    if (!unit) unit = Config.getStringValue('dimUnit')
    console.log('utils#dimension#cmToMeasure: unit: ', unit)
    const scale = Config.getNumericValue('scale')
    assertDefined(real, unit, scale)

    switch (unit) {
      case DIM_FEET:
        return Dimension.round((real * 0.032808416666669996953) / scale)
      case DIM_INCH:
        return Dimension.round((real * 0.3937) / scale)
      case DIM_MILLIMETER:
        return Dimension.round((real * 10) / scale)
      case DIM_CENTIMETER:
        return Dimension.round(real / scale)
      case DIM_METER:
        return Dimension.round((real * 0.01) / scale)
      default:
        return real
    }
  }
}
