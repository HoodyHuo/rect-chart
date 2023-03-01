import { Direction } from './orth/Constant'

import BoxConfig from './Config'

const Zrender = require('zrender')
import NodeBox from './shape/NodeBox'
import EditShape from './shape/EditShape'
import Line from './shape/Line'
import { calculateScalePosition, createPath } from './orth'
import { culaPosition, subDirection } from './shape/tool'
import { inBox } from './orth/util'
import { WorkbenchMode } from './shape/Const'
import { calcContentRect, fixSize, getCanvasCopyFromZrender } from './util'
import BoxSelection from './box-selection'
import MenuHandler from './menu/menu-handler'
import ScaleHelper from './scale-helper'

/**
 * 图形控制台
 */
class Workbench {
  /** 基本属性 */
  _elOri // 挂载的dom元素
  _el // 挂载zrender的元素
  _zr // zrender 实例
  _nodes // 节点数据记录
  _lines // 线段数据记录
  mode // 工作模式 @see WorkbenchMode

  /** 功能辅助对象 */
  boxSelection = null // 框选器
  _menuShape = null // 菜单对象，负责右键菜单处理
  _scaleTool = null // 缩放处理对象

  /** 点击选中暂存属性 */
  selectedBox = null // 当前被选中的节点
  selectedLine = null // 当前被选中的线段

  _resizeBox = null // 缩放盒子实例

  /** 实例内容 */
  _boxList = [] // 节点实例列表
  _lineList = [] // 线段实例列表

  _onNodeSelected // 节点点击回调函数
  _onLineSelected // 线点击回调函数

  /** 拖动创建节点、连线中间变量 */
  _tempName = 1
  _tempLine = null // 当前正在创建的线段实例
  _tempNode = null // 当前正在创建的节点实例

  /**
   * @constructor
   * @param options.el 挂载的dom元素
   *   @param options.nodes 节点数据记录
   *   @param options.lines 线段数据记录
   *   @param {WorkbenchMode} options.mode  工作模式
   *   @param options.onNodeSelected 节点点击回调函数
   *   @param options.onLineSelected 线点击回调函数
   */
  constructor(options) {
    this._elOri = options.el
    fixSize(this._elOri) // 固定el大小
    // 创建zrender挂载元素
    const zrenderEL = document.createElement('div')
    zrenderEL.style.width = this._elOri.clientWidth * 4 + 'px'
    zrenderEL.style.height = this._elOri.clientHeight * 4 + 'px'
    zrenderEL.style.backgroundColor = BoxConfig.wallpaperColor
    this._elOri.appendChild(zrenderEL)

    this._el = zrenderEL

    // 构建zrender实例
    this._zr = Zrender.init(zrenderEL)
    this.mode = options.mode
    this._nodes = options.nodes
    this._lines = options.lines
    this._onNodeSelected = options.onNodeSelected
    this._onLineSelected = options.onLineSelected

    this._bindingEvent()
    this._scaleTool = this._initScale()
    this._initResizeBox()
    this._createNodes()
    this._createLines()
    this.boxSelection = new BoxSelection(this._zr, this, this._scaleTool, this._onRectSelected)
    this._menuShape = new MenuHandler(this._zr)
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
    if (this.mode !== WorkbenchMode.EDIT) return
    const options = {
      x: param.x || 0,
      y: param.y || 0,
      width: param.width || 200,
      height: param.height || 100,
      target: param.target,
      name: param.name || '未命名' + this._tempName++,
      mode: this.mode,
      selectChange: this._onNodeClick.bind(this),
      move: this._onNodeMove.bind(this),
      onCreateLine: this._onCreateLine.bind(this),
      onMoveLine: this._onMoveLine.bind(this),
      onEndLine: this._onEndLine.bind(this),
      z: this._boxList.length,
    }

    options.x = options.x + options.width / 2
    options.y = options.y + options.height / 2
    const node = new NodeBox(options)
    this._scaleTool.add(node)

    this._scaleTool.group.add(node)

    this._tempNode = node
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
    if (this._tempNode && this._tempNode instanceof NodeBox) {
      //计算窗口位置移到缩放group之后的局部坐标
      const xy = this._scaleTool.transformCoordToLocal(position.x, position.y)

      this._tempNode.resize(
        xy[0] - this._tempNode.width / 2,
        xy[1] - this._tempNode.height / 2,
        this._tempNode.width,
        this._tempNode.height,
      )
    }
  }

  /**
   * 临时节点完成
   * 在鼠标抬起或移出范围时触发
   * @param {boolean} isKeep 是否保留
   */
  createNodeEnd(isKeep) {
    if (this._tempNode == null) return
    if (isKeep) {
      this._boxList.push(this._tempNode)
    } else {
      this._scaleTool.remove(this._tempNode)
    }
    this._tempNode = null
  }

  /**
   * 保存函数，提取所有节点和线段记录，用于下次加载
   * @return {{nodes: [], lines: []}}
   */
  save() {
    const lines = []
    for (let i = 0; i < this._lineList.length; i++) {
      const line = this._lineList[i]
      lines.push({
        target: line.target,
        from: line.from,
        to: line.to,
        path: line.path,
      })
    }

    const nodes = []
    for (let i = 0; i < this._boxList.length; i++) {
      const box = this._boxList[i]
      nodes.push({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        name: box.name,
        target: box.target,
      })
    }

    return { lines, nodes }
  }

  /**
   * 提取base64格式的截图，适应内容
   * @param padding 截图内边距
   * @returns {string}
   */
  getImgBase64(padding) {
    // 提取内容区域
    const { minX, minY, maxX, maxY } = calcContentRect(this._boxList, this._lineList)
    // 获取制定区域图像
    const canvasEl = getCanvasCopyFromZrender(this._zr, { x: minX, y: minY, w: maxX - minX, h: maxY - minY }, padding)
    // 转换base64
    const data = canvasEl.toDataURL('image/png')
    return data
  }

  /**
   * 清除所有元素
   */
  clear() {
    // 清除线条
    for (let i = 0; i < this._lineList.length; i++) {
      this._scaleTool.remove(this._lineList[i])
    }
    if (this._tempLine) {
      this._scaleTool.remove(this._tempLine)
    }
    // 清除节点
    for (let i = 0; i < this._boxList.length; i++) {
      this._scaleTool.remove(this._boxList[i])
    }
    // 清除缓存
    this._boxList = []
    this._lineList = []
    this._nodes = []
    this._lines = []
    this.selectedBox = null
    this.selectedLine = null
    this._tempLine = null
    this._resizeBox.hide()
  }

  /**
   * 初始化绑定事件
   * @private
   */
  _bindingEvent() {
    // 空白点击处理
    this._zr.on('mousedown', (e) => {
      console.dir(e.offsetX + '-' + e.offsetY)
      if (!e.target) {
        this._resizeBox.hide()
        this._onLineClick(null)
        this._onNodeClick(null)
      }
    })
  }

  /**
   * 根据当前窗口大小，和所有需要展示的元素计算显示缩放
   * 如果超出当前尺寸，则加上并设置缩放
   * @private
   */
  _initScale() {
    // 初始化缩放辅助对象
    const scaleTool = new ScaleHelper(this._zr, this, this._elOri, 1)
    // 根据内容进行缩放
    scaleTool.reScaleByContent(this._boxList, this._lineList)
    return scaleTool
  }

  /**
   * 初始化时根据节点数据创建节点实例
   * @private
   */
  _createNodes() {
    for (let i = 0; i < this._nodes.length; i++) {
      const nodeData = this._nodes[i]
      const opt2 = {
        mode: this.mode,
        selectChange: this._onNodeClick.bind(this),
        move: this._onNodeMove.bind(this),
        onCreateLine: this._onCreateLine.bind(this),
        onMoveLine: this._onMoveLine.bind(this),
        onEndLine: this._onEndLine.bind(this),
      }
      Object.assign(opt2, nodeData)
      opt2.z = i + 1
      const nodeBox = new NodeBox(opt2)
      this._scaleTool.add(nodeBox)
      this._boxList.push(nodeBox)
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
    for (let i = 0; i < this._boxList.length; i++) {
      if (inBox(position, this._boxList[i]) && (box === null || this._boxList[i].z1 > box.z1)) {
        box = this._boxList[i]
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
    const xy = this._scaleTool.transformCoordToLocal(position.x, position.y)

    const path = createPath(
      {
        x: startBox.x,
        y: startBox.y,
        width: startBox.width,
        height: startBox.height,
        direction: direction,
      },
      {
        x: xy[0] - 2,
        y: xy[1] - 2,
        width: 4,
        height: 4,
        direction: Direction.getReverse(direction),
      },
      20,
    )
    let scaleStart = { x: xy[0], y: xy[1] }
    if (path) {
      scaleStart = calculateScalePosition(startBox, { x: path[0][0], y: path[0][1] })
    }
    const line = new Line({
      mode: this.mode,
      target: { id: null },
      path: path,
      from: {
        zrenderId: startBox.id,
        target: startBox.target,
        scaleX: scaleStart.x,
        scaleY: scaleStart.y,
        direction: direction,
      },
      to: null,
      workbench: this,
      showHandle: true,
      clickCallback: this._onLineClick.bind(this),
    })

    this._scaleTool.add(line)
    this._tempLine = line
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
  _onMoveLine(startBox, startDirection, position, endBox, endDirection) {
    if (this._tempLine == null) return
    const path = createPath(
      {
        x: startBox.x,
        y: startBox.y,
        width: startBox.width,
        height: startBox.height,
        direction: startDirection,
      },
      {
        x: position.x,
        y: position.y,
        width: 0,
        height: 0,
        direction: endDirection || subDirection(position, culaPosition(startBox, startDirection)),
      },
      20,
    )
    this._tempLine.updatePath(path, startBox, startDirection, endBox, endDirection)
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
    if (this._tempLine.to == null) {
      this._scaleTool.remove(this._tempLine)
    } else {
      this._lineList.push(this._tempLine)
    }
    this._tempLine = null
  }

  /**
   * 处理节点反馈的点击事件
   * @param event
   * @param box
   * @private
   */
  _onNodeClick(event, box) {
    this.boxSelection.reset()
    /** 切换选择 */
    for (let i = 0; i < this._boxList.length; i++) {
      this._boxList[i].selected(false)
    }
    if (box) {
      box.selected(true)
      this._onLineClick(null)
      if (this.mode === WorkbenchMode.EDIT) {
        this._resizeBox.show(box)
      }

      this._onNodeSelected(event, box, box ? box.target : null)
    } else {
      this._resizeBox.hide()
    }
    this.selectedBox = box || null
  }

  /**
   * 当线被点击
   * @param event
   * @param line
   * @private
   */
  _onLineClick(event, line) {
    this.boxSelection.reset()
    // 设置所有线为未选中状态
    for (let i = 0; i < this._lineList.length; i++) {
      this._lineList[i].selected(false)
    }
    // 如果有选中线
    if (line) {
      line.selected(true) // 设置被选中
      this._onNodeClick(null) // 设置所有节点为未选中状态
      // 触发线选中事件上报
      this._onLineSelected(
        event,
        line,
        line
          ? {
              from: line.from,
              to: line.to,
              path: line.path,
              target: line.target,
            }
          : null,
      )
    }
    this.selectedLine = line || null
  }

  /**
   * 处理框选完成的事件
   * @param {NodeBox[]} boxList
   * @private
   */
  _onRectSelected(boxList) {
    for (let i = 0; i < boxList.length; i++) {
      boxList[i].selected(true)
    }
  }

  /**
   * 初始化尺寸控制盒子实例
   * @private
   */
  _initResizeBox() {
    const resizeBox = new EditShape({
      scaleTool:this._scaleTool,
      onSizeChange: this._onSizeChange.bind(this),
    })
    resizeBox.hide()
    this._scaleTool.add(resizeBox)
    this._resizeBox = resizeBox
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
      this._resizeBox._moveToBox(box)
    }
    // 如果有连接线，同步移动连接线
    this._redrawLineWhenBoxChange(box)
  }

  /**
   * 重绘盒子关联线段
   * @param box
   */
  _redrawLineWhenBoxChange(box) {
    for (let i = 0; i < this._lineList.length; i++) {
      const line = this._lineList[i]
      if (box.id === line.from.zrenderId || box.id === line.to.zrenderId) {
        line.updateBoxMove(this.getBoxByZrenderId(line.from.zrenderId), this.getBoxByZrenderId(line.to.zrenderId))
      }
    }
  }

  /**
   * 通过节点实例名称获取节点实例
   * @param zrenderId
   * @return {NodeBox} 节点实例
   */
  getBoxByZrenderId(zrenderId) {
    for (let i = 0; i < this._boxList.length; i++) {
      if (this._boxList[i].id === zrenderId) {
        return this._boxList[i]
      }
    }
    return null
  }

  /**
   * 删除节点
   * @param {NodeBox} box
   */
  removeBox(box) {
    if (this.mode !== WorkbenchMode.EDIT) return
    if (!box) return
    // 从列表和zrender 移除节点
    this._boxList = this._boxList.filter((value) => value !== box)
    this._scaleTool.remove(box)
    this._resizeBox.hide()
    // 删除节点相关连线
    this._lineList = this._lineList.filter((line) => {
      if (line.from.zrenderId === box.id || line.to.zrenderId === box.id) {
        this._scaleTool.remove(line)
        return false
      } else {
        return true
      }
    })
  }

  /**
   * 删除线材
   * @param {Line} line
   */
  removeLine(line) {
    if (this.mode !== WorkbenchMode.EDIT) return
    if (!line) return
    this._lineList = this._lineList.filter((value) => value !== line)
    this._scaleTool.remove(line)
  }

  /**
   * 重新装载数据
   * @param nodes
   * @param lines
   * @param isDoScale 是否根据内容进行缩放显示
   */
  reload(nodes, lines, isDoScale) {
    this.clear()
    this._nodes = nodes
    this._lines = lines
    this._createNodes()
    this._createLines()
    // 提供断开，让zrender生成layer，否则layer不能正确resize
    setTimeout(() => {
      if (isDoScale) {
        this._scaleTool.reScaleByContent(this._boxList, this._lineList)
      }
    }, 0)
  }

  /**
   * 切换模式
   * @param {number} mode from WorkbenchMode
   */
  changeMode(mode) {
    this.mode = mode

    for (let i = 0; i < this._boxList.length; i++) {
      this._boxList[i].changeMode(mode)
    }
    for (let i = 0; i < this._lineList.length; i++) {
      this._lineList[i].changeMode(mode)
    }
    if (mode === WorkbenchMode.VIEW) {
      this._resizeBox.hide()
    } else if (mode === WorkbenchMode.EDIT) {
      this._resizeBox.show(this.selectedBox)
    }
  }

  /**
   * 根据线段数据创建线段实例
   * @private
   */
  _createLines() {
    for (let i = 0; i < this._lines.length; i++) {
      const tempLine = this._lines[i]
      tempLine.workbench = this
      const line = new Line({
        target: tempLine.target,
        path: tempLine.path,
        from: tempLine.from,
        to: tempLine.to,
        state: tempLine.state,
        workbench: this,
        mode: this.mode,
        clickCallback: this._onLineClick.bind(this),
      })
      this._lineList.push(line)
      this._scaleTool.add(line)
    }
  }
}

export default Workbench
