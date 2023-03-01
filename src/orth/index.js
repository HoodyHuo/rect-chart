import { subV } from './util'
import { Direction } from './Constant'
import { getPathFindingData } from './route'
import { extendBox, inView, isOppositeDirection } from './layoutUtil'
import { lineRect } from './geometry'
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
 * @return {number[]} position
 */
function getOrigin(box) {
  switch (box.direction) {
    case Direction.TOP:
      return [box.x + box.width / 2, box.y]
    case Direction.BOTTOM:
      return [box.x + box.width / 2, box.y + box.height]
    case Direction.LEFT:
      return [box.x, box.y + box.height / 2]
    case Direction.RIGHT:
      return [box.x + box.width, box.y + box.height / 2]
  }
}

/**
 * 计算2个位置的朝向
 * @param {number[][]} from

 * @param {number[][]} to
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
 *
 * @param {array[number][number]}path
 * @return {undefined}
 * @private
 */
function _filteUselessPoints(path) {
  if (path.length < 4) return
  if (path[0][0] === path[2][0] || path[0][1] === path[2][1]) {
    path.splice(1, 1)
  }
  if (path[path.length - 3][0] === path[path.length - 1][0] || path[path.length - 3][1] === path[path.length - 1][1]) {
    path.splice(path.length - 2, 1)
  }
  return path
}

/**
 *
 * @param path
 * @param startAnchor
 * @param endAnchor
 * @return {array[number][number]}
 * @private
 */
function _moveAnchor(path, startAnchor, endAnchor) {
  if (!path) {
    return
  }
  if (startAnchor) {
    const dsx = startAnchor.x - path[0][0]
    const dsy = startAnchor.y - path[0][1]
    path[0][0] = startAnchor.x
    path[0][1] = startAnchor.y

    path[1][0] += dsx
    path[1][1] += dsy
  }

  if (endAnchor) {
    const dex = endAnchor.x - path[path.length - 1][0]
    const dey = endAnchor.y - path[path.length - 1][1]
    path[path.length - 1][0] = endAnchor.x
    path[path.length - 1][1] = endAnchor.y

    path[path.length - 2][0] += dex
    path[path.length - 2][1] += dey
  }

  return path
}

/**
 * 根据2个盒子，计算连接线
 * @param  startParam 起点参数
 * @param {number}  startParam.x 起点盒子的左上角x
 * @param {number}  startParam.y 起点盒子的左上角Y
 * @param {number}  startParam.width 盒子宽度
 * @param {number}  startParam.height 盒子高度
 * @param {number}  startParam.direction 连线出来的方向
 * @param {{x:number,y:number}}  startParam.anchor 起点盒子上连线的那一点坐标
 * @param endParam
 * @param {number} endParam.x
 * @param {number} endParam.y
 * @param {number} endParam.width
 * @param {number} endParam.height
 * @param {number} endParam.direction
 * @param {{x:number,y:number}}  endParam.anchor
 * @param {number} minDist
 */
export const createPath = (startParam, endParam, minDist) => {
  const startBox = [
    [startParam.x, startParam.y],
    [startParam.x + startParam.width, startParam.y],
    [startParam.x + startParam.width, startParam.y + startParam.height],
    [startParam.x, startParam.y + startParam.height],
  ]

  const endBox = [
    [endParam.x, endParam.y],
    [endParam.x + endParam.width, endParam.y],
    [endParam.x + endParam.width, endParam.y + endParam.height],
    [endParam.x, endParam.y + endParam.height],
  ]
  const startOrigin = getOrigin(startParam)
  const endOrigin = getOrigin(endParam)

  const start = { box: startBox, origin: startOrigin, direction: startParam.direction }
  const end = { box: endBox, origin: endOrigin, direction: endParam.direction }

  const { isCovered, isIntersect, startInfo, endInfo, allPoints, waypoint } = getPathFindingData(start, end, minDist)

  const checkedBoxs = [
    startInfo.boundaryBox && extendBox(startInfo.boundaryBox, -1),
    endInfo.boundaryBox && extendBox(endInfo.boundaryBox, -1),
  ].filter(Boolean)

  const checkedInnerBoxs = [startInfo.box, endInfo.box].filter(Boolean)

  // 相交且不是 coverd 并且方向相对才限制路径
  const costFactor = isIntersect
    ? !isCovered && isOppositeDirection([startInfo.direction, endInfo.direction])
      ? 2
      : 0
    : 5
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
    },
  })

  const result = find(grid, {
    startInfo,
    endInfo,
    isCovered,
    waypoint: isOppositeDirection([startInfo.direction, endInfo.direction]) ? waypoint : undefined,
    checkWaypointWalkable: (from, to) => {
      if (isCovered) {
        return true
      }

      return checkedBoxs.every((item) => !lineRect(from, to, item))
    },
  })
  // return {
  //   path: result,
  //   points: result.grid.points
  // }
  let path = _filteUselessPoints(result.path)
  path = _moveAnchor(path, startParam.anchor, endParam.anchor)
  return path
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

  return { x: offsetX / box.width, y: offsetY / box.height }
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
  return { x: box.x + box.width * scalePosition.scaleX, y: box.y + box.height * scalePosition.scaleY }
}
