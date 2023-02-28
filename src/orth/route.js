/**
 *
 * @param startBox
 * @param {number} startBox.x
 * @param {number} startBox.y
 * @param {number} startBox.width
 * @param {number} startBox.height
 * @param {number} startBox.direction
 * @param endBox
 * @param {number} endBox.x
 * @param {number} endBox.y
 * @param {number} endBox.width
 * @param {number} endBox.heigh
 * @param {number} endBox.direction
 * @param {number} minDist
 */
import { getMidPoint, rectRect } from './geometry'
import { getBoxConstraintsInfo, inView } from './layoutUtil'
import { Key } from './util'
// const boxPadding = 10

/**
 *
 * @param {number[][]} points
 * @return {number[][]}
 */
export const uniqPoints = (points) => {
  // Map<string, true>()
  const map = new Map()
  // number[][]
  const result = []

  points.forEach((item) => {
    const k = Key(item)
    if (!map.has(k)) {
      result.push(item)
      map.set(k, true)
    }
  })

  return result
}

/**
 *
 * @param {number[][]} points
 * @return {number[][]}
 */
export const getIntersectPoints = (points) => {
  // number[][]
  const results = []

  points.forEach((item, index) => {
    points.forEach((other, j) => {
      if (index !== j) {
        results.push([item[0], other[1]])
        results.push([other[0], item[1]])
      }
    })
  })

  return results
}

export const getPathFindingData = (start, end, minDist) => {
  // 两个盒子相交
  const isIntersect =
      start.box && end.box ? rectRect(start.box, end.box) : false
  const testBoxs = [
    [start.origin, end.box],
    [end.origin, start.box]
  ].filter((item) => item[1])

  // 起始点结速点都被另外一个盒子覆盖
  const isCovered = testBoxs.every(([p, box]) => inView(p, box))
  const [startInfo, endInfo] = getBoxConstraintsInfo(start, end, minDist, isCovered)

  const midPoint = getMidPoint(startInfo.endpoint, endInfo.endpoint)
  const middlePoints = [
    [startInfo.endpoint[0], midPoint[1]],
    [endInfo.endpoint[0], midPoint[1]],
    [midPoint[0], startInfo.endpoint[1]],
    [midPoint[0], endInfo.endpoint[1]],
    midPoint
  ]

  const waypoint = midPoint
  // number[][]
  const allPoints = [
    startInfo.endpoint,
    endInfo.endpoint,
    ...middlePoints
  ]

  if (!isCovered) {
    allPoints.push(
      ...(startInfo.boundaryBox || []),
      ...(endInfo.boundaryBox || [])
    )
  }

  return {
    isIntersect,
    isCovered,
    startInfo,
    endInfo,
    allPoints: uniqPoints(getIntersectPoints(allPoints)),
    waypoint
  }
}

