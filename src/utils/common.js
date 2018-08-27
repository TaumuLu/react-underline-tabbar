export const noop = () => {}

export const getType = (object) => {
  return Object.prototype.toString.call(object).slice(8, -1)
}

export const isEmpty = (value) => {
  const type = getType(value)

  switch (type) {
    case 'Array':
      return !value.length
    case 'Object':
      return !Object.keys(value).length
    default:
      return !value
  }
}

const baseGetSet = (path) => {
  const type = getType(path)
  switch (type) {
    case 'Array':
      return path
    case 'String':
    case 'Number':
      return `${path}`.split('.')
    default:
      return []
  }
}

export const get = (object, path, defaultValue) => {
  const pathArray = baseGetSet(path)

  return pathArray.reduce((obj, key) => {
    return (obj && obj[key]) ? obj[key] : null
  }, object) || defaultValue
}

export const set = (object, path, value) => {
  const pathArray = baseGetSet(path)
  const len = pathArray.length

  return pathArray.reduce((obj, key, ind) => {
    if (obj && ind === len - 1) {
      obj[key] = value
    }

    return obj ? obj[key] : null
  }, object)
}

export const keys = (value) => {
  const type = getType(value)

  switch (type) {
    case 'Array':
    case 'Object':
      return Object.keys(value)
    default:
      return []
  }
}

export const size = (value) => {
  if (value) {
    const type = getType(value)
    switch (type) {
      case 'Array':
        return value.length
      case 'Object':
        return keys(value).length
      default:
        return value.length || 0
    }
  }
  return 0
}

export const mergeWith = (originObject, mergeObject, handle) => {
  const originKeys = keys(originObject)
  const mergeKeys = keys(mergeObject)
  const reObject = {}
  originKeys.forEach((key) => {
    const mergeIndex = mergeKeys.indexOf(key)
    if (mergeIndex > -1) {
      reObject[key] = handle(originObject[key], mergeObject[key], key, originObject, mergeObject)
      mergeKeys.splice(mergeIndex, 1)
    } else {
      reObject[key] = originObject[key]
    }
  })
  mergeKeys.forEach((key) => {
    reObject[key] = mergeObject[key]
  })

  return reObject
}

export const mergeStyle = (...styles) => styles.reduce((p, c) => ({ ...(p || {}), ...(c || {}) }), {})

export const getMergeObject = (originObject, mergeObject) => {
  return mergeWith(originObject, mergeObject, (originValue, mergeValue) => {
    const type = getType(originValue)

    switch (type) {
      case 'Array':
        return [...originValue, ...mergeValue]
      case 'Function':
        return (...params) => { originValue(...params); mergeValue(...params) }
      case 'Object':
        return { ...originValue, ...mergeValue }
      default:
        return mergeValue
    }
  })
}

export const MatrixMath = {
  createIdentityMatrix() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]
  },
  reuseTranslate3dCommand(matrixCommand, x, y, z) {
    matrixCommand[12] = x
    matrixCommand[13] = y
    matrixCommand[14] = z
  },
  multiplyInto(out, a, b) {
    let a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3],
      a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7],
      a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11],
      a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15]

    let b0 = b[0],
      b1 = b[1],
      b2 = b[2],
      b3 = b[3]
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7]
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11]
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15]
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
  },
}

export function transformOrigin(matrix, origin) {
  const { x, y, z } = origin

  const translate = MatrixMath.createIdentityMatrix()
  MatrixMath.reuseTranslate3dCommand(translate, x, y, z)
  MatrixMath.multiplyInto(matrix, translate, matrix)

  const untranslate = MatrixMath.createIdentityMatrix()
  MatrixMath.reuseTranslate3dCommand(untranslate, -x, -y, -z)
  MatrixMath.multiplyInto(matrix, matrix, untranslate)
}

export function createTranslateXScaleX(scaleXFactor, x) {
  // prettier-ignore
  return [
    scaleXFactor, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    x, 0, 0, 1,
  ]
}
