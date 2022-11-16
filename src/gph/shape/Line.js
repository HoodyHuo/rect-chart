import { alignBorder } from '@/gph/shape/tool'

const zrender = require('zrender')
import LinePath from './LinePath'
import BoxConfig from '../BoxConfig'
import { calculatePosition, calculateScalePosition, createPath, getDirection } from '@/gph/orth'
const LineConfig = BoxConfig.Line.handle

// eslint-disable-next-line no-unused-vars
const circleOptions = {
  zlevel: 10,
  shape: {
    r: LineConfig.size
  },
  style: {
    // fill: 'transparent',
    stroke: LineConfig.color
  },
  draggable: true
}

/**
 * 连线
 */
class Line extends zrender.Group {
    Type = 'Line'

    // data
    path
    from
    to

    isSelected

    // view
    lineView = null
    // handlers
    pathPoints = []
    startPoint = null
    endPoint = null

    /**
     * @constructor
     * @param {Array[x:number,y:number]} options.path
     * @param {NodeBox} options.from
     * @param {NodeBox} options.to
     * @param {Workbench} options.workbench
     */
    constructor(options) {
      super({
        z: 30,
        x: 0,
        y: 0,
        height: 0,
        width: 0
      })
      this.from = options.from
      this.to = options.to
      this.path = options.path
      this.workbench = options.workbench
      this.isSelected = true
      this._createLine()
      this._createStartEndPoint()
      this._createLineHandler()
    }

    /**
     * 绘制线段
     * @private
     */
    _createLine() {
      this.lineView = new LinePath({
        data: this.path,
        silent: true
      })
      this.add(this.lineView)
    }

    /**
     * 创建起止拖拽点
     * @private
     */
    _createStartEndPoint() {
      if (!this.path || this.path.length === 0) {
        return
      }
      const startPointOpt = {
        x: this.path[0][0],
        y: this.path[0][0],
        ondrag: (event) => {
          this._connectMove(event, true)
        }
      }
      Object.assign(startPointOpt, circleOptions)
      this.startPoint = new zrender.Circle(startPointOpt)
      this.add(this.startPoint)

      const endPointOpt = {
        x: this.path[this.path.length - 1].x,
        y: this.path[this.path.length - 1].y,
        ondrag: (event) => {
          this._connectMove(event, false)
        }
      }
      Object.assign(endPointOpt, circleOptions)
      this.endPoint = new zrender.Circle(endPointOpt)
      this.add(this.endPoint)
    }

    /**
     * 创建线段移动点,从
     * @private
     */
    _createLineHandler() {
      if (this.path === null || this.path === undefined || this.path.length < 4) {
        return
      }
      for (let i = 1; i < this.path.length - 2; i++) {
        const point = this.path[i]
        const nextPoint = this.path[i + 1]
        const config = {
          z1: this.z1,
          cursor: nextPoint.x === point.x ? 'ew-resize' : 'ns-resize',
          x: (nextPoint.x + point.x) / 2,
          y: (nextPoint.y + point.y) / 2,
          ondrag: (event) => {
            this._lineHandlerMove(event, i, point, nextPoint)
          }
        }
        Object.assign(config, circleOptions)
        const handler = new zrender.Circle(config)
        this.pathPoints.push(handler)
        debugger
        this.add(handler)
      }
    }

    _removeLineHandler() {
      for (let i = 0; i < this.pathPoints.length; i++) {
        this.remove(this.pathPoints[i])
      }
      this.pathPoints = []
    }

    /**
     * 触发更新连线信息
     * @param {Array[][]} path  线路路径
     * @param {NodeBox} startBox 起点节点对象
     * @param {Direction} startDirection 起始方向
     * @param {NodeBox} endBox  结束节点
     * @param {Direction} endDirection 结束方向
     */
    updatePath(path, startBox, startDirection, endBox, endDirection) {
      if (!path) return
      this.path = path
      if (startBox) {
        const { x, y } = calculateScalePosition(startBox, { x: path[0][0], y: path[0][1] })
        this.from = {
          name: startBox.name,
          scaleX: x,
          scaleY: y,
          direction: startDirection
        }
      }

      if (endBox) {
        const { x, y } = calculateScalePosition(endBox,
          { x: path[path.length - 1][0], y: path[path.length - 1][1] })
        this.to = {
          name: endBox.name,
          scaleX: x,
          scaleY: y,
          direction: endDirection
        }
      }

      this.startPoint.x = path[0][0]
      this.startPoint.y = path[0][1]
      this.startPoint.dirty()

      this.endPoint.x = path[path.length - 1][0]
      this.endPoint.y = path[path.length - 1][1]
      this.endPoint.dirty()

      this.lineView.updatePath(path)
      this._removeLineHandler()
      this._createLineHandler()
    }

    /**
     * 连线的起止点拖动
     * @param event e
     * @param {boolean} isStart 是否拖动的起点
     * @private
     */
    _connectMove(event, isStart) {
      let boxDirection = null
      let position = { x: event.offsetX, y: event.offsetY }
      let overBox = this.workbench.getDragEnter([event.offsetX, event.offsetY])

      // 1.计算鼠标当前落在那个节点上,落到的位置在哪儿
      if (overBox !== null) {
        const endAl = alignBorder(position, overBox)
        boxDirection = endAl.direction
        position = endAl.pos
      } else {
        // 2. 如果没有落点，则在鼠标位置创造一个虚拟box
        overBox = {
          x: position.x,
          y: position.y,
          width: 0,
          height: 0
          // direction: null
        }
        boxDirection = isStart
          ? getDirection([position.x, position.y], this.path[this.path.length - 1])
          : getDirection(this.path[0], [position.x, position.y])
      }

      const startBox = isStart ? overBox : this.workbench.getBoxByName(this.from.name)
      const endBox = !isStart ? overBox : this.workbench.getBoxByName(this.to.name)

      const path = createPath(
        {
          x: startBox.x,
          y: startBox.y,
          width: startBox.width,
          height: startBox.height,
          direction: isStart ? boxDirection : this.from.direction,
          anchor: isStart ? position : null
        }, {
          x: endBox.x,
          y: endBox.y,
          width: endBox.width,
          height: endBox.height,
          direction: this.to.direction,
          anchor: !isStart ? position : null
        }, 20
      )
      this.updatePath(path,
        isStart ? startBox : null, isStart ? boxDirection : this.from.direction,
        !isStart ? endBox : null, !isStart ? boxDirection : this.to.direction)
    }

    /**
     * 当box节点移动，重绘路线路
     * @param {NodeBox} startBox
     * @param {NodeBox} endBox
     */
    updateBoxMove(startBox, endBox) {
      const startPos = calculatePosition(startBox, this.from)
      const endPos = calculatePosition(endBox, this.to)
      const path = createPath(
        {
          x: startBox.x,
          y: startBox.y,
          width: startBox.width,
          height: startBox.height,
          direction: this.from.direction,
          anchor: startPos
        }, {
          x: endBox.x,
          y: endBox.y,
          width: endBox.width,
          height: endBox.height,
          direction: this.to.direction,
          anchor: endPos
        }, 20
      )
      this.updatePath(path, startBox, this.from.direction, endBox, this.to.direction)
    }

    /**
     * @deprecated
     * @param index
     * @param position
     * @param box
     */
    alginBorder(index, position, box) {
      if (box === null) {
        return
      }
      const { pos } = alignBorder(position, box)
      if (index === 0) {
        this.from = box.name
        this.startPoint.x = pos.x
        this.startPoint.y = pos.y
        this.startPoint.dirty()
      }

      if (index === this.path.length - 1) {
        this.to = box.name
        this.endPoint.x = pos.x
        this.endPoint.y = pos.y
        this.endPoint.dirty()
      }
      this.path[index].y = pos.y
      this.path[index].x = pos.x
      this.lineView.dirty()
    }

    /**
     * 调整线材的链接中间
     * @param event
     * @param i
     * @param point
     * @param nextPoint
     * @private
     */
    _lineHandlerMove(event, i, point, nextPoint) {
      const dx = nextPoint.x === point.x ? event.offsetX - (nextPoint.x + point.x) / 2 : 0
      const dy = nextPoint.y === point.y ? event.offsetY - (nextPoint.y + point.y) / 2 : 0

      this.path[i].x += dx
      this.path[i].y += dy
      this.path[i + 1].x += dx
      this.path[i + 1].y += dy

      this._removeLineHandler()
      this._createLineHandler()
      this.lineView.updatePath(this.path)
    }
}

export default Line
