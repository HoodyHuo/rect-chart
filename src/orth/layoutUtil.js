import { addV, subV } from './util'
import { Direction } from './Constant'

const cloneDeep = (t) => {
  return JSON.parse(JSON.stringify(t))
}

const moveDeltaConfig = {
  [Direction.LEFT]: [0, -1],
  [Direction.RIGHT]: [0, 1],
  [Direction.TOP]: [-1, 0],
  [Direction.BOTTOM]: [1, 0],
}

const oppositeDirectionConfig = {
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.TOP]: Direction.BOTTOM,
  [Direction.BOTTOM]: Direction.TOP,
  [Direction.RIGHT]: Direction.LEFT,
}

/**
 *
 * @param {Direction} dir
 * @return {*}
 */
const getOppositeDirection = (dir) => {
  return oppositeDirectionConfig[dir]
}

/**
 *
 * @param {number[][]} box
 * @param {number} d
 * @return {*[]}
 */
export const extendBox = (box, d) => {
  const result = box.map((item) => [...item])

  result[0] = addV(result[0], [-d, -d])
  result[1] = addV(result[1], [d, -d])
  result[2] = addV(result[2], [d, d])
  result[3] = addV(result[3], [-d, d])

  return result
}

/**
 *
 * @param {PathFindingPointData} start
 * @param {Direction} start.direction
 * @param {number[]} start.origin
 * @param {number[]} start.endpoint
 * @param {PathFindingPointData} end
 * @param {Direction} end.direction
 * @param {number[]} end.origin
 * @param {number[]} end.endpoint
 * @param {number[]} waypoint
 * @param {Grid} grid
 * @param {function }canThrough (from: number[], to: number[]) => boolean
 * @return {boolean}
 */
export const checkCanFollowWaypoint = (start, end, waypoint, grid, canThrough) => {
  if (!isOppositeDirection([start.direction, end.direction])) {
    return false
  }

  const coord = grid.getGridPoint(waypoint)
  const startCoord = grid.getGridPoint(start.endpoint)
  const endCoord = grid.getGridPoint(end.endpoint)
  const xLimits = [startCoord[0], endCoord[0]]
  const yLimits = [startCoord[1], endCoord[1]]

  ;[xLimits, yLimits].forEach((item) => {
    item.sort((a, b) => a - b)
  })

  const isH = isHorizontal(start.direction)
  const base = isH ? coord[1] : coord[0]
  const limits = isH ? yLimits : xLimits

  /**
   *
   * @param {number} index
   * @return {(number|*)[]|(*|number)[]}
   */
  const getCoord = (index) => (isH ? [coord[0], index] : [index, coord[1]])

  /**
   *  水平方向 检查水平方向都能通过 直到达到结束点开始点
   *  垂直方向 检查导航点垂直方向都能通过 直到达到结束点开始点
   */

  for (let i = base, j = base; i >= limits[0] && j <= limits[1]; i--, j++) {
    if (
      !canThrough(grid.getRealPoint(getCoord(i)), grid.getRealPoint(getCoord(i + 1))) ||
      !canThrough(grid.getRealPoint(getCoord(j)), grid.getRealPoint(getCoord(j - 1)))
    ) {
      return false
    }
  }
  return true
}

/**
 *
 * @param {number[]} from
 * @param {number[]} to
 * @param {Direction} direction
 * @return {boolean}
 */
export const checkDirectionIsValid = (from, to, direction) => {
  const d = subV(to, from)

  let disabled = false

  switch (direction) {
    case Direction.TOP:
      disabled = d[0] < 0
      break
    case Direction.LEFT:
      disabled = d[1] < 0
      break
    case Direction.RIGHT:
      disabled = d[1] > 0

      break
    default:
      disabled = d[0] > 0
  }

  return !disabled
}

/**
 *
 * @param {Direction} dir
 * @param {boolean} first
 * @return {*[]}
 */
export const getMoveDelta = (dir, first) => {
  // Direction[]
  const dirs = Object.keys(moveDeltaConfig)

  if (first) {
    const current = dirs.filter((item) => item !== getOppositeDirection(dir))

    current.sort((a) => (a === dir ? -1 : 1))

    return current.map((item) => moveDeltaConfig[item])
  }

  dirs.sort((a, b) => (a === dir ? -1 : 1))

  return dirs.map((item) => moveDeltaConfig[item])
}

/**
 *
 * @param { number[]} point
 * @param {number[][]} box
 * @return {boolean}
 */
export const inView = (point, box) => {
  return point[0] >= box[0][0] && point[0] <= box[1][0] && point[1] >= box[0][1] && point[1] <= box[2][1]
}

const getPointConstraintsInfo = (start, end) => {
  return [start, end].map((item) => ({
    ...item,
    endpoint: item.origin.slice(),
  }))
}

/**
 *
 * @param {Direction} dir
 * @return {boolean}
 */
const isHorizontal = (dir) => {
  return dir === Direction.LEFT || dir === Direction.RIGHT
}

/**
 *
 * @param {Direction[]} dirs
 * @return {boolean}
 */
export const isOppositeDirection = (dirs) => {
  const list = [
    [Direction.LEFT, Direction.RIGHT],
    [Direction.TOP, Direction.BOTTOM],
  ]

  const conditions = [[...dirs].reverse(), dirs]

  return list.some((item) => conditions.some((source) => source[0] === item[0] && source[1] === item[1]))
}

/**
 *
 * @param {number[]} origin
 * @param {number[][] | undefined} box
 * @param {number[]} axis
 * @param {number[][] | undefined} otherBox
 * @param {number[]} otherAxis
 * @param {number} index
 * @return {boolean}
 */
const checkIsContained = (origin, box, axis, otherBox, otherAxis, index) => {
  // 没边界比较时不需要考虑是否包含
  if (!otherBox) {
    return true
  }

  // 这里不能用 <= >=
  if (box && otherBox) {
    return axis.some(
      (j) => box[j][index] > otherBox[otherAxis[0]][index] && box[j][index] < otherBox[otherAxis[1]][index],
    )
  }

  // 比存在

  return origin[index] > otherBox[otherAxis[0]][index] && origin[index] < otherBox[otherAxis[1]][index]
}

/**
 *
 * @param start
 * @param end
 * @param minDist
 * @param isCovered
 * @return
 */
export const getBoxConstraintsInfo = (start, end, minDist, isCovered) => {
  if (!start.box && !end.box) {
    return getPointConstraintsInfo(start, end)
  }

  const list = [start, end].map((item) => {
    return Object.assign(
      {
        ...cloneDeep(item),
        endpoint: cloneDeep(item.origin),
      },
      item.box
        ? {
            boundaryBox: extendBox(item.box, minDist),
            originBoundaryBox: extendBox(item.box, minDist),
          }
        : {},
    )
  })

  const deltaMap = {
    [Direction.TOP]: -1,
    [Direction.LEFT]: -1,
    [Direction.RIGHT]: 1,
    [Direction.BOTTOM]: 1,
  }
  // : Record<Direction, [number[], number[]]>
  const axisMap = {
    // [from, compared]
    [Direction.TOP]: [
      [0, 1],
      [3, 2],
    ],
    [Direction.LEFT]: [
      [0, 3],
      [1, 2],
    ],
    [Direction.RIGHT]: [
      [1, 2],
      [0, 3],
    ],
    [Direction.BOTTOM]: [
      [3, 2],
      [0, 1],
    ],
  }

  // 内部相交直接按内部查找
  if (isCovered) {
    list.forEach(({ direction, endpoint, origin }) => {
      const currentD = deltaMap[direction]
      const index = isHorizontal(direction) ? 0 : 1

      endpoint[index] = origin[index] + minDist * currentD
    })

    return list
  }

  const allDirs = Object.keys(deltaMap)

  list.forEach(({ box, direction, endpoint, origin, boundaryBox, originBoundaryBox }, i) => {
    allDirs.forEach((dir) => {
      const axis = axisMap[dir]
      const other = list[(i + 1) % 2]
      const [currentAxis, otherAxis] = axis
      const currentD = deltaMap[dir]
      const index = isHorizontal(dir) ? 0 : 1
      const restIndex = index === 0 ? 1 : 0

      const contained = checkIsContained(
        origin,
        originBoundaryBox,
        currentAxis,
        other.originBoundaryBox,
        otherAxis,
        restIndex,
      )

      const base = box ? box[currentAxis[0]] : origin

      const dist = other.box ? other.box[otherAxis[0]][index] - base[index] : other.origin[index] - base[index]
      // 点在其它何盒子直接相连 不需要考虑
      const d = dist > 0 ? 1 : -1
      const pointDist = Math.abs(dist) / 2

      const shouldAdjust = d === currentD && Math.abs(dist) < minDist * 2
      // 方向是当前方向时且另外一个盒子存在，那么包含才需要调整 padding
      const needContained = contained

      /**
       * 方向相对
       * 比如 [ ] - [ ]
       *     current => other
       * [ ] current
       *  |
       * [ ] other
       */
      if (needContained && shouldAdjust) {
        if (box && boundaryBox) {
          currentAxis.forEach((a) => {
            boundaryBox[a][index] = box[a][index] + currentD * pointDist
          })
        }

        if (other.box) {
          otherAxis.forEach((a) => {
            // 对于被比较的盒子 距离增加相反
            other.boundaryBox[a][index] = other.box[a][index] + currentD * pointDist * -1
          })
        }

        if (dir === direction) {
          endpoint[index] = origin[index] + currentD * pointDist
        }
      } else if (dir === direction) {
        endpoint[index] = origin[index] + minDist * currentD
      }
    })
  })

  return list
}
