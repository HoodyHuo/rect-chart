const zrender = require('zrender')
import LinePath from './LinePath'
import BoxConfig from '../BoxConfig'
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

class Line extends zrender.Group {
    // data
    path
    from
    to

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
        x: 0,
        y: 0,
        height: 0,
        width: 0
      })
      this.from = options.from
      this.to = options.to
      this.path = options.path
      this.pathPoints = []
      this.workbench = options.workbench
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
      const startPointOpt = {
        x: this.path[0].x,
        y: this.path[0].y,
        ondrag: (event) => {
          this._connectMove(event, 0)
        }
      }
      Object.assign(startPointOpt, circleOptions)
      this.startPoint = new zrender.Circle(startPointOpt)
      this.add(this.startPoint)

      const endPointOpt = {
        x: this.path[this.path.length - 1].x,
        y: this.path[this.path.length - 1].y,
        ondrag: (event) => {
          this._connectMove(event, this.path.length - 1)
        }
      }
      Object.assign(endPointOpt, circleOptions)
      this.endPoint = new zrender.Circle(endPointOpt)
      this.add(this.endPoint)
    }

    /**
     * 创建线段移动点
     * @private
     */
    _createLineHandler() {

    }

    /**
     * 线段推动
     * @param event
     * @param number 节点序号
     * @private
     */
    _connectMove(event, number) {
      if ((number === 0 || number === this.path.length - 1) && this.workbench.getDragEnter() !== null) {
        this.alginBorder(number,
          { x: event.offsetX, y: event.offsetY },
          this.workbench.getDragEnter())
      } else {
        this._movePath(event, number)
      }
    }

    _movePath(event, number) {
      this.path[number] = {
        x: event.offsetX,
        y: event.offsetY
      }
      this.lineView.dirty()
    }

    alginBorder(index, position, dragEnter) {
      if (dragEnter === null) {
        return
      }
      if (position.x >= dragEnter.x &&
       position.y >= dragEnter.y &&
       position.x <= dragEnter.x + dragEnter.width &&
       position.y <= dragEnter.y + dragEnter.height) {
        const sort = []
        sort.push({ p: 'top', v: Math.abs(position.y - dragEnter.y) })
        sort.push({ p: 'bottom', v: Math.abs(position.y - (dragEnter.y + dragEnter.height)) })
        sort.push({ p: 'left', v: Math.abs(position.x - dragEnter.x) })
        sort.push({ p: 'right', v: Math.abs(position.x - (dragEnter.x + dragEnter.width)) })
        sort.sort((a, b) => {
          return a.v - b.v
        })
        const bindPoint = { x: position.x, y: position.y }
        const st1 = sort[0]
        switch (st1.p) {
          case 'top':
            bindPoint.y = dragEnter.y
            break
          case 'bottom':
            bindPoint.y = dragEnter.y + dragEnter.height
            break
          case 'left':
            bindPoint.x = dragEnter.x
            break
          case 'right':
            bindPoint.x = dragEnter.x + dragEnter.width
            break
        }
        if (index === 0) {
          this.startPoint.x = bindPoint.x
          this.startPoint.y = bindPoint.y
          this.startPoint.dirty()
        }

        if (index === this.path.length - 1) {
          this.endPoint.x = bindPoint.x
          this.endPoint.y = bindPoint.y
          this.endPoint.dirty()
        }

        this.path[index].y = bindPoint.y
        this.path[index].x = bindPoint.x
        this.lineView.dirty()
      }
    }
}

export default Line
