import { Direction } from '../orth/Constant'

/**
 * 计算边框贴近位置
 * @param position 位置
 * @param {number} position.x
 * @param {number} position.y
 * @param box 盒子
 * @param {number} box.x
 * @param {number} box.y
 * @param {number} box.width
 * @param {number} box.height
 *
 * @return {{pos: {x: number, y: number}, direction: string}}
 */
export const alignBorder = (position, box) => {
  if (
    position.x >= box.x &&
    position.y >= box.y &&
    position.x <= box.x + box.width &&
    position.y <= box.y + box.height
  ) {
    const sort = []
    sort.push({ p: Direction.TOP, v: Math.abs(position.y - box.y) })
    sort.push({ p: Direction.BOTTOM, v: Math.abs(position.y - (box.y + box.height)) })
    sort.push({ p: Direction.LEFT, v: Math.abs(position.x - box.x) })
    sort.push({ p: Direction.RIGHT, v: Math.abs(position.x - (box.x + box.width)) })
    sort.sort((a, b) => {
      return a.v - b.v
    })
    const bindPoint = { x: position.x, y: position.y }
    const st1 = sort[0]
    switch (st1.p) {
      case Direction.TOP:
        bindPoint.y = box.y
        break
      case Direction.BOTTOM:
        bindPoint.y = box.y + box.height
        break
      case Direction.LEFT:
        bindPoint.x = box.x
        break
      case Direction.RIGHT:
        bindPoint.x = box.x + box.width
        break
    }

    return { pos: bindPoint, direction: st1.p }
  } else {
    return { pos: position, direction: null }
  }
}

/**
 * 根据盒子和朝向，计算点位置
 * @param {Direction} direction
 * @param box 盒子
 * @param {number} box.x
 * @param {number} box.y
 * @param {number} box.width
 * @param {number} box.height
 *
 * @return {x: number, y: number}
 */
export const culaPosition = (box, direction) => {
  switch (direction) {
    case Direction.TOP:
      return { x: box.x + box.width / 2, y: box.y }
    case Direction.BOTTOM:
      return { x: box.x + box.width / 2, y: box.y + box.height }
    case Direction.LEFT:
      return { x: box.x, y: box.y + box.height / 2 }
    case Direction.RIGHT:
      return { x: box.x + box.width, y: box.y + box.height / 2 }
  }
}

/**
 * 计算从起点到终点的朝向
 * @param from
 * @param to
 *
 * @return {direction} direction
 */
export const subDirection = (from, to) => {
  const vV = from.y - to.y // 垂直距离
  const vH = from.x - to.x // 水平距离
  if (Math.abs(vV) > Math.abs(vH)) {
    return vV >= 0 ? Direction.TOP : Direction.BOTTOM
  } else {
    return vH >= 0 ? Direction.LEFT : Direction.RIGHT
  }
}
