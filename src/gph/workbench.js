import { Direction } from '@/gph/orth/Constant'

const Zrender = require('zrender')
import NodeBox from './NodeBox'
import EditShape from './shape/EditShape'
import Line from './shape/Line'
import { calculateScalePosition, createPath } from './orth'
import { culaPosition, subDirection } from '@/gph/shape/tool'

class Workbench {
  el // the DOM element
  zr // zrender instance
  nodes // array of node json
  lines // array of relative path

  selectedBox = null // the selected node
  selectedLine = null // the selected line
  boxList = [] // array of DrawNode
  lineList = [] // array of RelativePath
  resizeBox = null

  dragEnter = null // 当前拖拽进入的对象
  clickNodeCallback // callback

  tempLine = null // 当前正在拖动的连接线

  eventMap = {}

  /**
     * @constructor
     * @param options.el
   *   @param options.nodes
   *   @param options.lines
   *   @param options.clickNode
     */
  constructor(options) {
    this.el = options.el
    this.nodes = options.nodes
    this.lines = options.lines
    this.zr = Zrender.init(options.el)
    this.clickNodeCallback = options.clickNode

    this._bindingEvent()
    this._initResizeBox()
    this._createNodes()
    this._createLines()
  }

  save() {
    const lines = []

    const nodes = []
    for (let i = 0; i < this.boxList.length; i++) {
      const box = this.boxList[i]
      nodes.push({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        name: box.name,
        target: box.target
      })
    }

    return { lines, nodes }
  }

  _bindingEvent() {
    this.zr.on('click', (e) => {
      console.dir(e.offsetX + '-' + e.offsetY)
    })
    this.zr.on('mouseup', () => {
      this.dragEnter = null
    })
  }

  _createNodes() {
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeData = this.nodes[i]
      const opt2 = {
        selectChange: this._onNodeClick.bind(this),
        move: this._onNodeMove.bind(this),
        onDragEnter: event => {
          this.dragEnter = event.target.parent
          if (event.topTarget.id === event.target.id) {
            return
          }
        },
        onDragLeave: event => {
          this.dragEnter = null
        },
        onCreateLine: this._onCreateLine.bind(this),
        onMoveLine: this._onMoveLine.bind(this),
        onEndLine: this._onEndLine.bind(this)
      }
      Object.assign(opt2, nodeData)
      opt2.z = i + 1
      const nodeBox = new NodeBox(opt2)
      this.zr.add(nodeBox)
      this.boxList.push(nodeBox)
    }
  }
  getDragEnter() {
    return this.dragEnter
  }

  /**
   * 当鼠标拖拽开始，创建连线
   * @param {NodeBox} startBox 触发的节点
   * @param {Direction} direction 起始方向
   * @param {Object} position 鼠标位置
   * @param {number} position.x
   * @param {number} position.y
   *
   * @private
   */
  _onCreateLine(startBox, direction, position) {
    // {
    //   from: 'zrender1',
    //       to: 'zrender2',
    //     path: [
    //   { x: 100, y: 100 },
    //   { x: 220, y: 120 },
    //   { x: 450, y: 100 }
    // ]
    // }
    const path = createPath({
      x: startBox.x,
      y: startBox.y,
      width: startBox.width,
      height: startBox.height,
      direction: direction
    }, {
      x: position.x - 2,
      y: position.y - 2,
      width: 4,
      height: 4,
      direction: Direction.getReverse(direction)
    }, 20)
    let scaleStart = { x: position.x, y: position.y }
    if (path) {
      scaleStart = calculateScalePosition(startBox, { x: path[0][0], y: path[0][1] })
    }
    const line = new Line({
      path: path,
      from: {
        name: startBox.name,
        scaleX: scaleStart.x,
        scaleY: scaleStart.y,
        direction: direction
      },
      to: null,
      workbench: this
    })
    this.zr.add(line)
    this.tempLine = line
  }

  /**
   * 当鼠标拖拽，调整连线
   * @param {NodeBox} startBox 触发的节点
   * @param {Direction} startDirection 起始方向
   * @param {Object} position 鼠标位置
   * @param {number} position.x
   * @param {number} position.y
   * @param {NodeBox} endBox 触发的节点
   * @param {Direction} endDirection 起始方向
   *
   * @private
   */
  _onMoveLine(startBox, startDirection,
    position,
    endBox, endDirection) {
    if (this.tempLine == null) return
    const path = createPath(
      {
        x: startBox.x,
        y: startBox.y,
        width: startBox.width,
        height: startBox.height,
        direction: startDirection
      }, {
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        direction: endDirection || subDirection(position, culaPosition(startBox, startDirection))
      }, 20
    )
    this.tempLine.updatePath(path, startBox, startDirection, endBox, endDirection)
  }

  /**
   * 当鼠标拖拽，调整连线
   * @param {NodeBox} startBox 触发的节点
   * @param {Direction} startDirection 起始方向
   * @param {Object} position 鼠标位置
   * @param {number} position.x
   * @param {number} position.y
   * @param {NodeBox} endBox 触发的节点
   * @param {Direction} endDirection 起始方向
   *
   * @private
   */
  _onEndLine(startBox, startDirection, position, endBox, endDirection) {
    if (this.tempLine.to == null) {
      this.zr.remove(this.tempLine)
    } else {
      this.lineList.push(this.tempLine)
    }
    this.tempLine = null
  }

  _onNodeClick(event, box) {
    if (this.selectedBox !== box) {
      if (this.selectedBox !== null) {
        this.selectedBox.selected(false)
      }
      if (box) {
        this.selectedBox = box
        this.selectedBox.selected(true)
        this.resizeBox.show(box)
      }
    }
    /**
     * 上报选择事件
     * @param event Zrender事件
     * @param target 盒子绑定的数据对象
     */
    this.clickNodeCallback(event, box ? box.target : null)
  }

  _initResizeBox() {
    const resizeBox = new EditShape({
      onSizeChange: this._onSizeChange.bind(this)
    })
    resizeBox.hide()
    this.zr.add(resizeBox)
    this.resizeBox = resizeBox
  }

  _onSizeChange(box, param) {
    this._redrawLineWhenBoxChange(box)
  }
  _onNodeMove(event, box) {
    // 如果有缩放框，则同步移动缩放框
    if (this.selectedBox === box) {
      this.resizeBox._moveToBox(box)
    }
    // 如果有连接线，同步移动连接线
    this._redrawLineWhenBoxChange(box)
  }

  _redrawLineWhenBoxChange(box) {
    for (let i = 0; i < this.lineList.length; i++) {
      const line = this.lineList[i]
      if (box.name === line.from.name || box.name === line.to.name) {
        line.updateBoxMove(this._getBoxByName(line.from.name), this._getBoxByName(line.to.name))
      }
    }
  }

  _getBoxByName(name) {
    for (let i = 0; i < this.boxList.length; i++) {
      if (this.boxList[i].name === name) {
        return this.boxList[i]
      }
    }
    return null
  }

  _createLines() {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].workbench = this
      const line = new Line(this.lines[i])

      this.lineList.push(line)
      this.zr.add(line)
    }
  }
}

export default Workbench
