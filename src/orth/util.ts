/**
 *sdf
 * @param {number[]} v1
 * @param {number[]} v2
 */
export const subV = (v1: any[], v2: number[]) => {
  return v1.map((item: number, index: number) => item - v2[index])
}

/**
 *
 * @param {number[]} position
 * @param {{x:number,y:number,width:number,height:number}} box
 */
export const inBox = (position: number[], box: { x: number; width: any; y: number; height: any }) => {
  return (
    position[0] >= box.x &&
    position[0] <= box.x + box.width &&
    position[1] >= box.y &&
    position[1] <= box.y + box.height
  )
}

/**
 *
 * @param {number[]} v1
 * @param {number[]} v2
 * @return {unknown[]}
 */
export const addV = (v1: any[], v2: any[]) => v1.map((item: any, index: number) => item + v2[index])

/**
 *
 * @param {number[]} p1
 * @param {number[]} p2
 * @return {number}
 */
export const calculateEuclideanDist = (p1: number[], p2: number[]) => {
  return Math.hypot(...subV(p2, p1).map(Math.abs))
}
/**
 *
 * @param {number[]}  p1
 * @param {number[]} p2
 * @return {*}
 */
export const calculateManhattanDist = (p1: number[], p2: any) => {
  const d = subV(p2, p1).map(Math.abs)

  return d[0] + d[1]
}

/**
 *
 * @param {number[]} p
 * @return {string}
 * @constructor
 */
export const Key = (p: any[]) => p.join(':')

/**
 *
 * @param {string} key
 * @return {number[]}
 */
export const getXYDFromKey = (key: string) => key.split(':').map(Number)
