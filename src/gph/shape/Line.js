import { alignBorder } from '@/gph/shape/tool'

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
    Type = 'Line'

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
     * 更新路劲
     * @param {Array[][]} path
     * @param {NodeBox} startBox 起点节点
     * @param {NodeBox} endBox  结束节点
     */
    updatePath(path, startBox, endBox) {
      this.path = path
      this.from = startBox ? startBox.name : null
      this.to = endBox ? endBox.name : null

      this.startPoint.x = path[0][0]
      this.startPoint.y = path[0][1]
      this.startPoint.dirty()

      this.endPoint.x = path[path.length - 1][0]
      this.endPoint.y = path[path.length - 1][1]
      this.endPoint.dirty()

      for (let i = 0; i < path.length; i++) {
        path[i] = { x: path[i][0], y: path[i][1] }
      }
      this.lineView.updatePath(path)
    }

    /**
     * 线段推动
     * @param event e
     * @param {number} index 节点序号
     * @private
     */
    _connectMove(event, index) {
      if ((index === 0 || index === this.path.length - 1) && this.workbench.getDragEnter() !== null) {
        this.alginBorder(index,
          { x: event.offsetX, y: event.offsetY },
          this.workbench.getDragEnter())
      } else {
        this._movePath(event, index)
      }
    }

    _movePath(event, number) {
      this.path[number] = {
        x: event.offsetX,
        y: event.offsetY
      }
      this.lineView.dirty()
    }

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
}

export default Line
