import { Direction } from './orth/Constant'

import BoxConfig from './Config'
const Zrender = require('zrender')
import NodeBox from './NodeBox'
import EditShape from './shape/EditShape'
import Line from './shape/Line'
import { calculateScalePosition, createPath } from './orth'
import { culaPosition, subDirection } from './shape/tool'
import { inBox } from './orth/util'

/**
 * 图形控制台
 */
class Workbench {
  el // 挂载的dom元素
  zr // zrender 实例
  nodes // 节点数据记录
  lines // 线段数据记录

  selectedBox = null // 当前被选中的节点
  selectedLine = null // 当前被选中的线段
  boxList = [] // 节点实例列表
  lineList = [] // 线段实例列表
  resizeBox = null // 缩放盒子实例

  clickNodeCallback // 节点点击回调函数

  tempName = 1
  tempLine = null // 当前正在创建的线段实例
  tempNode = null // 当前正在创建的节点实例

  /**
     * @constructor
     * @param options.el 挂载的dom元素
   *   @param options.nodes 节点数据记录
   *   @param options.lines 线段数据记录
   *   @param options.clickNode 节点点击回调函数
     */
  constructor(options) {
    this.el = options.el
    this.nodes = options.nodes
    this.lines = options.lines
    this.zr = Zrender.init(options.el)
    this.clickNodeCallback = options.clickNode

    this.el.style.backgroundColor = BoxConfig.wallpaperColor
    this._bindingEvent()
    this._initResizeBox()
    this._createNodes()
    this._createLines()
  }

  /**
   * 创建节点
   * @param param 节点参数
   * @param param.x 创建位置x
   * @param param.y 创建位置y
   * @param param.width 宽
   * @param param.height 高
   * @param param.name 显示名称（唯一）
   *
   * @param param.target 携带关联信息
   * @param isFinished 是否直接创建完成
   */
  createNode(param, isFinished) {
    const options = {
      x: param.x || 0,
      y: param.y || 0,
      width: param.width || 200,
      height: param.height || 100,
      target: param.target,
      name: param.name || '未命名' + this.tempName++,
      selectChange: this._onNodeClick.bind(this),
      move: this._onNodeMove.bind(this),
      onCreateLine: this._onCreateLine.bind(this),
      onMoveLine: this._onMoveLine.bind(this),
      onEndLine: this._onEndLine.bind(this),
      z: this.boxList.length
    }

    options.x = options.x + options.width / 2
    options.y = options.y + options.height / 2
    const node = new NodeBox(options)
    this.zr.add(node)
    this.tempNode = node
    if (isFinished) {
      this.createNodeEnd(true)
    }
  }

  /**
   * 移动临时节点
   * 当鼠标保持按下状态移动时触发
   * @param event
   * @param position
   */
  tempNodeMoving(event, position) {
    if (this.tempNode && this.tempNode instanceof NodeBox) {
      this.tempNode.resize(
        position.x - this.tempNode.width / 2, position.y - this.tempNode.height / 2,
        this.tempNode.width, this.tempNode.height)
    }
  }

  /**
   * 临时节点完成
   * 在鼠标抬起或移出范围时触发
   * @param {boolean} isKeep 是否保留
   */
  createNodeEnd(isKeep) {
    if (this.tempNode == null) return
    if (isKeep) {
      this.boxList.push(this.tempNode)
    } else {
      this.zr.remove(this.tempNode)
    }
    this.tempNode = null
  }

  /**
   * 保存函数，提取所有节点和线段记录，用于下次加载
   * @return {{nodes: [], lines: []}}
   */
  save() {
    const lines = []
    for (let i = 0; i < this.lineList.length; i++) {
      const line = this.lineList[i]
      lines.push({
        from: line.from,
        to: line.to,
        path: line.path
      })
    }

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

  /**
   * 清除所有元素
   */
  clear() {
    // 清除线条
    for (let i = 0; i < this.lineList.length; i++) {
      this.zr.remove(this.lineList[i])
    }
    if (this.tempLine) {
      this.zr.remove(this.tempLine)
    }
    // 清除节点
    for (let i = 0; i < this.boxList.length; i++) {
      this.zr.remove(this.boxList[i])
    }
    // 清除缓存
    this.boxList = []
    this.lineList = []
    this.nodes = []
    this.lines = []
    this.selectedBox = null
    this.selectedLine = null
    this.tempLine = null
    this.resizeBox.hide()
  }

  /**
   * 初始化绑定事件
   * @private
   */
  _bindingEvent() {
    this.zr.on('click', (e) => {
      console.dir(e.offsetX + '-' + e.offsetY)
      if (!e.target) {
        this.resizeBox.hide()
        this._onLineClick(null)
        this._onNodeClick(null)
      }
    })
  }

  /**
   * 初始化时根据节点数据创建节点实例
   * @private
   */
  _createNodes() {
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeData = this.nodes[i]
      const opt2 = {
        selectChange: this._onNodeClick.bind(this),
        move: this._onNodeMove.bind(this),
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

  /**
   * 获取当前鼠标悬停节点实例
   * 通过循环判断覆盖的box，并返回z1最高的节点实例
   * @param {number[]} position 需要判断的位置
   *
   * @return {NodeBox} mouseover node
   */
  getPositionBox(position) {
    let box = null
    for (let i = 0; i < this.boxList.length; i++) {
      if (inBox(position, this.boxList[i]) &&
          (box === null || this.boxList[i].z1 > box.z1)) {
        box = this.boxList[i]
      }
    }
    return box
  }

  /**
   * 当鼠标拖拽开始，创建连线
   * @param {NodeBox} startBox 触发的节点
   * @param {Direction} direction 起始方向
   * @param {{x:number,y:number}} position 鼠标位置
   *
   * @private
   */
  _onCreateLine(startBox, direction, position) {
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
      workbench: this,
      showHandle: true,
      clickCallback: this._onLineClick.bind(this)
    })
    this.zr.add(line)
    this.tempLine = line
  }

  /**
   * 当鼠标拖拽，调整连线
   * @param {NodeBox} startBox 触发的节点
   * @param {Direction} startDirection 起始方向
   * @param {{x:number,y:number}} position 鼠标位置
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
   * @param {{x:number,y:number}} position 鼠标位置
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

  removeLine(line) {
    for (let i = 0; i < this.lineList; i++) {
      if (line === this.lineList[i]) {
        this.lineList.splice(i, 1)
        break
      }
    }
    this.zr.remove(line)
  }

  /**
   * 处理节点反馈的点击事件
   * @param event
   * @param box
   * @private
   */
  _onNodeClick(event, box) {
    /** 切换选择 */
    if (this.selectedBox !== box) {
      if (this.selectedBox !== null) {
        this.selectedBox.selected(false)
      }
      if (box) {
        this.selectedBox = box
        this.selectedBox.selected(true)
        this.resizeBox.show(box)
      }
      if (event !== null) {
        this._onLineClick(null)
      }
    }
    /**
     * 上报选择事件
     * @param event Zrender事件
     * @param target 盒子绑定的数据对象
     */
    this.clickNodeCallback(event, box ? box.target : null)
  }
  _onLineClick(event, line) {
    for (let i = 0; i < this.lineList.length; i++) {
      this.lineList[i].selected(false)
    }
    if (line) {
      line.selected(true)
      this.selectedLine = line
    }
    if (event !== null) {
      this._onNodeClick(null)
      this.resizeBox.hide()
    }
  }

  /**
   * 初始化尺寸控制盒子实例
   * @private
   */
  _initResizeBox() {
    const resizeBox = new EditShape({
      onSizeChange: this._onSizeChange.bind(this)
    })
    resizeBox.hide()
    this.zr.add(resizeBox)
    this.resizeBox = resizeBox
  }

  /**
   * 监听节点实例尺寸变化事件
   * @param box
   * @param param
   * @private
   */
  _onSizeChange(box, param) {
    /** 通知节点实例关联线段重绘 */
    this._redrawLineWhenBoxChange(box)
  }

  /**
   * 处理当节点移动时的事件
   * @param event zrender 事件
   * @param box 移动的节点实例
   * @private
   */
  _onNodeMove(event, box) {
    // 如果有缩放框，则同步移动缩放框
    if (this.selectedBox && this.selectedBox.id === box.id) {
      this.resizeBox._moveToBox(box)
    }
    // 如果有连接线，同步移动连接线
    this._redrawLineWhenBoxChange(box)
  }

  /**
   * 重绘盒子关联线段
   * @param box
   * @private
   */
  _redrawLineWhenBoxChange(box) {
    for (let i = 0; i < this.lineList.length; i++) {
      const line = this.lineList[i]
      if (box.name === line.from.name || box.name === line.to.name) {
        line.updateBoxMove(this.getBoxByName(line.from.name), this.getBoxByName(line.to.name))
      }
    }
  }

  /**
   * 通过节点实例名称获取节点实例
   * @param name 名称
   * @return {NodeBox} 节点实例
   */
  getBoxByName(name) {
    for (let i = 0; i < this.boxList.length; i++) {
      if (this.boxList[i].name === name) {
        return this.boxList[i]
      }
    }
    return null
  }

  /**
   * 根据线段数据创建线段实例
   * @private
   */
  _createLines() {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].workbench = this
      const line = new Line({
        path: this.lines[i].path,
        from: this.lines[i].from,
        to: this.lines[i].to,
        state: this.lines[i].state,
        workbench: this,
        clickCallback: this._onLineClick.bind(this)
      })

      this.lineList.push(line)
      this.zr.add(line)
    }
  }
}

export default Workbench
