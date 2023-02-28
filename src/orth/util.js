/**
 *
 * @param {number[]} v1
 * @param {number[]} v2
 */
export function subV(v1, v2) {
  return v1.map((item, index) => item - v2[index])
}

/**
 *
 * @param {number[]} position
 * @param {{x:number,y:number,width:number,height:number}} box
 */
export const inBox = (position, box) => {
  return position[0] >= box.x &&
      position[0] <= box.x + box.width &&
      position[1] >= box.y &&
      position[1] <= box.y + box.height
}

/**
 *
 * @param {number[]} v1
 * @param {number[]} v2
 * @return {unknown[]}
 */
export const addV = (v1, v2) =>
  v1.map((item, index) => item + v2[index])

/**
 *
 * @param {number[]} p1
 * @param {number[]} p2
 * @return {number}
 */
export const calculateEuclideanDist = (p1, p2) => {
  return Math.hypot(...subV(p2, p1).map(Math.abs))
}
/**
 *
 * @param {number[]}  p1
 * @param {number[]} p2
 * @return {*}
 */
export const calculateManhattanDist = (p1, p2) => {
  const d = subV(p2, p1).map(Math.abs)

  return d[0] + d[1]
}

/**
 *
 * @param {number[]} p
 * @return {string}
 * @constructor
 */
export const Key = (p) => p.join(':')

/**
 *
 * @param {string} key
 * @return {number[]}
 */
export const getXYDFromKey = (key) => key.split(':').map(Number)
