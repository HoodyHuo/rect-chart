import { alignBorder } from './tool'

const zrender = require('zrender')
import LinePath from './LinePath'
import Config from '../Config'
import { calculatePosition, calculateScalePosition, createPath, getDirection } from '../orth'
import { WorkbenchMode } from '../shape/Const'
import Arrow from '../shape/Arrow'
import { Direction } from '../orth/Constant'

const LineConfig = Config.Line

const circleOptions = {
  zlevel: 10,
  shape: {
    r: LineConfig.handle.size
  },
  style: {
    // fill: 'transparent',
    stroke: LineConfig.handle.color
  },
  draggable: true
}

/**
 * 连线类
 */
class Line extends zrender.Group {
    Type = 'Line'

    /** 线路数据 number[][] */
    path

    /** 起点、终点信息 from、to
     *
     *     name: string, //节点 名称
     *     scaleX: x, // 在节点内的相对位置
     *     scaleY: y,
     *     direction: startDirection //起点朝向
     * */
    from
    to
    state // string 线路状态。（默认default）

    isSelected

    // 线条绘制层
    lineView = null
    // 线段调整按钮列表
    pathPoints = []
    // 起点连接头
    startPoint = null
    // 终点连接头
    endPoint = null
    // arrow
    arrow

    /**
     * 构造函数
     * @constructor
     * @param {number[number[]]} options.path 线段路径
     * @param {{name:string,scaleX:number,scaleY:number,direction:Direction}} options.from
     * @param {{name:string,scaleX:number,scaleY:number,direction:Direction}} options.to
     * @param {Workbench} options.workbench
     * @param {string} options.state
     * @param {boolean} options.showHandle
     * @param {Workbench} options.clickCallback
     */
    constructor(options) {
      super({
        zlevel: 30,
        x: 0,
        y: 0,
        height: 0,
        width: 0
      })
      this.from = options.from
      this.to = options.to
      this.path = options.path
      this.state = options.state
      this.workbench = options.workbench
      this.isSelected = options.showHandle || false
      this.clickCallback = options.clickCallback
      this.onclick = (event) => {
        options.clickCallback(event, this)
      }
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
        // silent: true,
        style: {
          stroke: LineConfig.color[this.state] || LineConfig.color['default']
        },
        draggable: false
      })
      this.add(this.lineView)

      this.arrow = new Arrow({
        draggable: false,
        style: {
          stroke: LineConfig.color[this.state] || LineConfig.color['default'],
          fill: LineConfig.color[this.state] || LineConfig.color['default']
        },
        shape: {
          x: this.path[this.path.length - 1][0],
          y: this.path[this.path.length - 1][1],
          direction: Direction.getReverse(this.to ? this.to.direction || Direction.TOP : Direction.TOP)
        }
      })
      this.add(this.arrow)
    }

    /**
     * 创建起止拖拽点
     * @private
     */
    _createStartEndPoint() {
      if (!this.path || this.path.length === 0) {
        this.path = [[0, 0]]
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
      this.isSelected ? this.startPoint.show() : this.startPoint.hide()
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
      this.isSelected ? this.endPoint.show() : this.endPoint.hide()
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
          cursor: nextPoint[0] === point[0] ? 'ew-resize' : 'ns-resize',
          x: (nextPoint[0] + point[0]) / 2,
          y: (nextPoint[1] + point[1]) / 2,
          ondrag: (event) => {
            this._lineHandlerMove(event, i, point, nextPoint)
          }
        }
        Object.assign(config, circleOptions)
        const handler = new zrender.Circle(config)
        this.pathPoints.push(handler)
        this.isSelected ? handler.show() : handler.hide()
        this.add(handler)
      }
    }

    /**
     * 设置线段选中状态
     * @param isSelected
     */
    selected(isSelected) {
      for (let i = 0; i < this.pathPoints.length; i++) {
        isSelected && this.mode === WorkbenchMode.EDIT ? this.pathPoints[i].show() : this.pathPoints[i].hide()
      }
      isSelected && this.mode === WorkbenchMode.EDIT ? this.startPoint.show() : this.startPoint.hide()
      isSelected && this.mode === WorkbenchMode.EDIT ? this.endPoint.show() : this.endPoint.hide()
      this.isSelected = isSelected
      this.dirty()
    }

    updateState(state) {
      this.state = state
      const color = LineConfig.color[state] || LineConfig.color['default']
      this.lineView.updateColor(color)
      this.endPoint.updateColor(color)
    }

    /**
     * 移除线段调整按钮
     * @private
     */
    _removeLineHandler() {
      for (let i = 0; i < this.pathPoints.length; i++) {
        this.remove(this.pathPoints[i])
      }
      this.pathPoints = []
    }

    /**
     * 触发更新连线信息
     * @param {number[number[]]} path  线路路径
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
      this.arrow.updatePosition(
        { x: path[path.length - 1][0], y: path[path.length - 1][1] },
        Direction.getReverse(this.to.direction))
      this._removeLineHandler()
      this._createLineHandler()
    }

    /**
     *
     * @param {WorkbenchMode:number} mode
     */
    changeMode(mode) {
      this.mode = mode
      this.selected(this.isSelected)
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
      let overBox = this.workbench.getPositionBox([event.offsetX, event.offsetY])

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
     * @param event zrender event
     * @param i 移动的点序号（介于 i 和 i+1）
     * @param point i
     * @param nextPoint i+1
     * @private
     */
    _lineHandlerMove(event, i, point, nextPoint) {
      const dx = nextPoint[0] === point[0] ? event.offsetX - (nextPoint[0] + point[0]) / 2 : 0
      const dy = nextPoint[1] === point[1] ? event.offsetY - (nextPoint[1] + point[1]) / 2 : 0

      this.path[i][0] += dx
      this.path[i][1] += dy
      this.path[i + 1][0] += dx
      this.path[i + 1][1] += dy
      const path = this.path

      this._removeLineHandler()
      this._createLineHandler()
      this.lineView.updatePath(this.path)
      this.arrow.updatePosition({ x: path[path.length - 1][0], y: path[path.length - 1][1] },
        Direction.getReverse(this.to.direction))
    }
}

export default Line
