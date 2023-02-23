import { floatStrTrim } from './common'
import { DIM_CENTIMETER, FLOAT_DIGITS, SCALE } from './constants'

let config = {
  dimUnit: DIM_CENTIMETER,
  scale: SCALE,
}

export class Config {
  static setValue(key, value) {
    config[key] = value
  }

  static getValue(key) {
    return config[key]
  }

  static getNumericValue(key, floatDigits = FLOAT_DIGITS) {
    return floatStrTrim(Config.getValue(key), floatDigits)
  }

  static getStringValue(key) {
    return String(Config.getValue(key))
  }
}
