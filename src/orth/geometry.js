/**
 *
 * @param {number[]} a1
 * @param {number[]} a2
 * @param {number[]} b1
 * @param {number[]} b2
 * @return {boolean}
 */
import { addV, calculateEuclideanDist } from './util'

// 见 pathfindingjs
/**
 *
 * @param {number[][]} path
 * @return {number[][]|[]}
 */
export const compressPath = (path) => {
  // nothing to compress
  if (path.length < 3) {
    return path
  }

  const compressed = []
  const sx = path[0][0] // start x
  const sy = path[0][1] // start y
  let px = path[1][0] // second point x
  let py = path[1][1] // second point y
  let dx = px - sx // direction between the two points
  let dy = py - sy // direction between the two points
  let lx
  let ly
  let ldx
  let ldy
  let sq
  let i

  // normalize the direction
  sq = Math.sqrt(dx * dx + dy * dy)
  dx /= sq
  dy /= sq

  // start the new path
  compressed.push([sx, sy])

  for (i = 2; i < path.length; i++) {
    // store the last point
    lx = px
    ly = py

    // store the last direction
    ldx = dx
    ldy = dy

    // next point
    px = path[i][0]
    py = path[i][1]

    // next direction
    dx = px - lx
    dy = py - ly

    // normalize
    sq = Math.sqrt(dx * dx + dy * dy)
    dx /= sq
    dy /= sq

    // if the direction has changed, store the point
    if (dx !== ldx || dy !== ldy) {
      compressed.push([lx, ly])
    }
  }

  // store the last point
  compressed.push([px, py])

  return compressed
}

export function lineLine(a1, a2, b1, b2) {
  // b1->b2向量 与 a1->b1向量的向量积
  const ua_t = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0])
  // a1->a2向量 与 a1->b1向量的向量积
  const ub_t = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0])
  // a1->a2向量 与 b1->b2向量的向量积
  const u_b = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1])
  // u_b == 0时，角度为0或者180 平行或者共线不属于相交
  if (u_b !== 0) {
    const ua = ua_t / u_b
    const ub = ub_t / u_b

    if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
      return true
    }
  }

  return false
}

/**
 *
 * @param startBox

 * @param endBox

 * @returns {boolean}
 */
export const rectRect = (startBox, endBox) => {
  const l = 4

  return (
    startBox.some((_, i) => lineRect(startBox[i], startBox[(i + 1) % l], endBox)) ||
    endBox.some((_, i) => lineRect(endBox[i], endBox[(i + 1) % l], startBox))
  )
}
/**
 *
 * @param {number[]} p
 * @param {number[]} q
 * @param {number[]} t
 * @return {boolean}
 */
export const isCollinear = (p, q, t) => {
  const accuracy = 0
  // 3点围成的三角形面积
  const area = p[0] * q[1] - p[1] * q[0] + q[0] * t[1] - q[1] * t[0] + t[0] * p[1] - t[1] * p[0]
  const edge = calculateEuclideanDist(p, q)

  return Math.abs(area / edge) <= accuracy
}

/**
 *
 * @param {number[][]} path
 * @return {number}
 */
export const getNumberOfInflectionPoints = (path) => {
  if (path.length < 3) {
    return 0
  }

  let count = 0

  for (let i = 1; i < path.length - 1; i++) {
    if (!isCollinear(path[i - 1], path[i + 1], path[i])) {
      count++
    }
  }

  return count
}

/**
 *
 * @param {number[]} a1
 * @param {number[]} a2
 * @param {number[][]} b
 * @returns {boolean}
 */
export const lineRect = (a1, a2, b) => {
  const [r0, r1, r2, r3] = b

  if (lineLine(a1, a2, r0, r1)) return true
  if (lineLine(a1, a2, r1, r2)) return true
  if (lineLine(a1, a2, r2, r3)) return true
  if (lineLine(a1, a2, r3, r0)) return true
  return false
}
/**
 *
 * @param {number[]} p1
 * @param {number[]} p2
 * @return {number[]}
 */
export const getMidPoint = (p1, p2) => addV(p1, p2).map((item) => Math.round(item / 2))
