import { subV } from '@/gph/orth/util'
import { Direction } from './Constant'
import { getPathFindingData } from './route'
import { extendBox, inView, isOppositeDirection } from '@/gph/orth/layoutUtil'
import { lineRect } from '@/gph/orth/geometry'
import Grid from './Grid'
import find from './find'

/**
 * 从 项目 翻译而来 https://juejin.cn/post/6971413180836741151#heading-6
 * https://github.com/raohong/flowchart-orth
 *
 */

/**
 * 获取盒子连线的起点
 * @param box
 * @param {number} box.x
 * @param {number} box.y
 * @param {number} box.width
 * @param {number} box.height
 * @param {number} box.direction
 *
 * @return position
 */
function getOrigin(box) {
  switch (box.direction) {
    case Direction.TOP:
      return [box.x + (box.width / 2), box.y]
    case Direction.BOTTOM:
      return [box.x + (box.width / 2), box.y + box.height]
    case Direction.LEFT:
      return [box.x, box.y + (box.height / 2)]
    case Direction.RIGHT:
      return [box.x + box.width, box.y + (box.height / 2)]
  }
}

/**
 * 计算2个位置的朝向
 * @param from
 * @param {number} from.x from x
 * @param {number} from.y from y
 * @param to
 * @param {number} to.x to
 * @param {number} to.y to
 *
 * @returns {string}
 */
export const getDirection = (from, to) => {
  const v = subV(to, from)

  if (v.y === 0) {
    return v.y > 0 ? Direction.BOTTOM : Direction.TOP
  }

  return v.x > 0 ? Direction.RIGHT : Direction.LEFT
}
/**
 * 根据2个盒子，计算连接线
 * @param  startParam
 * @param {number}  startParam.x
 * @param {number}  startParam.y
 * @param {number}  startParam.width
 * @param {number}  startParam.height
 * @param {number}  startParam.direction
 * @param endParam
 * @param {number} endParam.x
 * @param {number} endParam.y
 * @param {number} endParam.width
 * @param {number} endParam.height
 * @param {number} endParam.direction
 * @param {number} minDist
 */
export const createPath = (startParam, endParam, minDist) => {
  const startBox = [
    [startParam.x, startParam.y],
    [startParam.x + startParam.width, startParam.y],
    [startParam.x + startParam.width, startParam.y + startParam.height],
    [startParam.x, startParam.y + startParam.height]
  ]

  const endBox = [
    [endParam.x, endParam.y],
    [endParam.x + endParam.width, endParam.y],
    [endParam.x + endParam.width, endParam.y + endParam.height],
    [endParam.x, endParam.y + endParam.height]
  ]
  const startOrigin = getOrigin(startParam)
  const endOrigin = getOrigin(endParam)

  const start = { box: startBox, origin: startOrigin, direction: startParam.direction }
  const end = { box: endBox, origin: endOrigin, direction: endParam.direction }
  // debugger
  const { isCovered, isIntersect, startInfo, endInfo, allPoints, waypoint } =
      getPathFindingData(start, end, minDist)

  const checkedBoxs = [
    startInfo.boundaryBox && extendBox(startInfo.boundaryBox, -1),
    endInfo.boundaryBox && extendBox(endInfo.boundaryBox, -1)
  ].filter(Boolean)

  const checkedInnerBoxs = [startInfo.box, endInfo.box].filter(Boolean)

  // 相交且不是 coverd 并且方向相对才限制路径
  const costFactor = isIntersect ? !isCovered &&
      isOppositeDirection([startInfo.direction, endInfo.direction]) ? 2 : 0 : 5
  const shouldCheck = checkedBoxs.length === 2 ? !isIntersect : !isCovered

  const grid = new Grid(allPoints, {
    getCost(p, basic) {
      const t = [0, 1].reduce((total, index) => {
        // 走里面的 cost 更多
        if (checkedInnerBoxs[index] && inView(p, checkedInnerBoxs[index])) {
          return total + 2
        }

        if (checkedBoxs[index] && inView(p, checkedBoxs[index])) {
          return total + 1
        }

        return total
      }, 0)

      return basic + t * costFactor
    },
    /**
     *
     * @param {number[]} current
     * @param{number[]}  next
     * @return {this is *[][]|boolean}
     */
    getWalkable(current, next) {
      if (shouldCheck) {
        return checkedBoxs.every((item) => !lineRect(current, next, item))
      }

      return true
    }
  })

  const result = find(grid, {
    startInfo,
    endInfo,
    isCovered,
    waypoint: isOppositeDirection([startInfo.direction, endInfo.direction])
      ? waypoint
      : undefined,
    checkWaypointWalkable: (from, to) => {
      if (isCovered) {
        return true
      }

      return checkedBoxs.every((item) => !lineRect(from, to, item))
    }
  })
  // return {
  //   path: result,
  //   points: result.grid.points
  // }
  return result.path
}

/**
 * 计算position 在盒子里面的 比列位置
 * @param  box
 * @param {number}  box.x
 * @param {number}  box.y
 * @param {number}  box.width
 * @param {number}  box.height
 * @param position
 * @param {number}  position.x
 * @param {number}  position.y
 *
 * @return {{x: number, y: number}} scalePosition
 */
export const calculateScalePosition = (box, position) => {
  const offsetX = position.x - box.x
  const offsetY = position.y - box.y

  return { x: offsetX / box.width, y: offsetY / box.y }
}
/**
 * 计算position 在盒子里面的 比列位置
 * @param  box
 * @param {number}  box.x
 * @param {number}  box.y
 * @param {number}  box.width
 * @param {number}  box.height
 * @param scalePosition
 * @param {number}  scalePosition.scaleX
 * @param {number}  scalePosition.scaleY
 *
 * @return {{x: number, y: number}} position
 */
export const calculatePosition = (box, scalePosition) => {
  return { x: box.x + box.width * scalePosition.scaleX,
    y: box.y + box.height * scalePosition.scaleY }
}
