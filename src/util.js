import Config from './Config'
import { Direction } from './orth/Constant'
/**
 * 提取zrender制定区域的图像，并创建canvas对象装入
 * @param {Zrender} zrenderIns  zrender实例
 * @param {JSON} size 矩形
 * @param   {number} size.x 矩形x
 * @param   {number} size.y 矩形y
 * @param   {number} size.w 矩形宽度
 * @param   {number} size.h 矩形高度
 * @param   {number} padding 截图内边距
 * @returns { HTMLCanvasElement }
 */
export const getCanvasCopyFromZrender = (zrenderIns, size, padding) => {
  if (!padding) {
    padding = 25
  }
  if (padding instanceof Number) {
    throw new Error('padding必须为数字')
  }
  // 创建内存canvas用于生成图片
  const canvasEl = document.createElement('canvas')
  canvasEl.width = size.w + padding * 2
  canvasEl.height = size.h + padding * 2
  const ctx = canvasEl.getContext('2d')
  // 填充背景色
  ctx.moveTo(0, 0)
  ctx.lineTo(canvasEl.width, 0)
  ctx.lineTo(canvasEl.width, canvasEl.height)
  ctx.lineTo(0, canvasEl.height)
  ctx.lineTo(0, 0)
  ctx.fillStyle = Config.wallpaperColor
  ctx.fill()

  // 将zrender的每一层canvas的layer 按顺序绘制到 canvasEL中
  const layerList = zrenderIns.painter.getLayers()
  const zLevelList = zrenderIns.painter._zlevelList
  for (let i = 0; i < zLevelList.length; i++) {
    const _zlevel = zLevelList[i]
    const ctxTemp = layerList[_zlevel].dom
    ctx.drawImage(ctxTemp,
      size.x, size.y, size.w, size.h,
      padding, padding, size.w, size.h
    )
  }

  return canvasEl
}

/**
 * 计算内容的包围盒
 * @param {NodeBox[]} nods 节点列表
 * @param {Line[]} lines 线列表
 * @returns {{minY: number, minX: number, maxY: number, maxX: number}}
 */
export const calcContentRect = (nods, lines) => {
  let minX = 9999
  let maxX = 0
  let minY = 9999
  let maxY = 0

  for (let i = 0; i < nods.length; i++) {
    const node = nods[i]
    minX = node.x < minX ? node.x : minX
    minY = node.y < minY ? node.y : minY
    maxX = node.x + node.width > maxX ? node.x + node.width : maxX
    maxY = node.y + node.height > maxY ? node.y + node.height : maxY
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    for (let j = 0; j < line.path.length; j++) {
      minX = line.path[j][0] < minX ? line.path[j][0] : minX
      minY = line.path[j][1] < minY ? line.path[j][1] : minY
      maxX = line.path[j][0] > maxX ? line.path[j][0] : maxX
      maxY = line.path[j][1] > maxY ? line.path[j][1] : maxY
    }
  }

  return { minX, minY, maxX, maxY }
}

/**
 * 计算盒子是否在矩形内
 * @param rect 矩形
 *   @param rect.x 矩形
 *   @param rect.y 矩形
 *   @param rect.width 矩形
 *   @param rect.height 矩形
 * @param box 盒子
 *   @param box.x 盒子
 *   @param box.y 盒子
 *   @param box.width 盒子
 *   @param box.height 盒子
 * @returns {boolean}
 */
export const boxContain = (rect, box) => {
  return box.x > rect.x &&
    box.y > rect.y &&
    box.width + box.x < rect.width + rect.x &&
    box.height + box.y < rect.height + rect.y
}

// 固定尺寸，并且设置滚动
export function fixSize(el) {
  el.style.width = el.clientWidth + 'px'
  el.style.height = el.clientHeight + 'px'
  el.style.overflowX = 'auto'
  el.style.overflowY = 'auto'
  el.style.lineHeight = 1
}

/**
 * 通过向上查找，获取最顶层group
 * 用于查询节点、线的子元素属于那个节点、线
 * @param shape
 * @returns {*}
 */
export const findParent = (shape) => {
  if (typeof shape.parent !== 'undefined' 
  && shape.parent !== null 
  && shape.parent.name !== "scale" // 排除最顶层的缩放group
  ) {
    return findParent(shape.parent)
  } else {
    return shape
  }
}

export function alignNodes(nodes, direction) {
  switch (direction) {
    case Direction.LEFT:
      // eslint-disable-next-line no-case-declarations
      const left = Math.min(...nodes.map(it => it.x))
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].resize(left, nodes[i].y, nodes[i].width, nodes[i].height)
      }
      break
    case Direction.RIGHT:
      // eslint-disable-next-line no-case-declarations
      const right = Math.max(...nodes.map(it => it.x + it.width))
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].resize(right - nodes[i].width, nodes[i].y, nodes[i].width, nodes[i].height)
      }
      break
    case Direction.TOP:
      // eslint-disable-next-line no-case-declarations
      const top = Math.min(...nodes.map(it => it.y))
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].resize(nodes[i].x, top, nodes[i].width, nodes[i].height)
      }
      break
    case Direction.BOTTOM:
      // eslint-disable-next-line no-case-declarations
      const bottom = Math.max(...nodes.map(it => it.y + it.height))
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].resize(nodes[i].x, bottom - nodes[i].height, nodes[i].width, nodes[i].height)
      }
      break
  }
}


export function getBoundingRect(boxList) {
if(boxList.length<1){
  return {
    x:0,y:0,width:0,height:0
  }
}

  let x1 = Number.MAX_VALUE
  let x2 = Number.MIN_VALUE

  let y1 = Number.MAX_VALUE
  let y2 = Number.MIN_VALUE

  for (let box of boxList) {
    x1 = box.x < x1 ? box.x : x1
    x2 = box.x + box.width > x2 ? box.x + box.width : x2

    y1 = box.y < y1 ? box.y : y1
    y2 = box.y + box.height > y2 ? box.y + box.height : y2
  }

  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }

}