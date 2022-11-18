import { Direction } from './orth/Constant'

import BoxConfig from './Config'

const Zrender = require('zrender')
import NodeBox from './NodeBox'
import EditShape from './shape/EditShape'
import Line from './shape/Line'
import { calculateScalePosition, createPath } from './orth'
import { culaPosition, subDirection } from './shape/tool'
import { inBox } from './orth/util'
import { WorkbenchMode } from './shape/Const'

/**
 * 图形控制台
 */
class Workbench {
    _el // 挂载的dom元素
    _zr // zrender 实例
    _nodes // 节点数据记录
    _lines // 线段数据记录

    mode // 工作模式 @see WorkbenchMode

    selectedBox = null // 当前被选中的节点
    selectedLine = null // 当前被选中的线段
    _boxList = [] // 节点实例列表
    _lineList = [] // 线段实例列表
    _resizeBox = null // 缩放盒子实例

    _onNodeSelected // 节点点击回调函数
    _onLineSelected // 线点击回调函数

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
      this._el = options.el
      this._nodes = options.nodes
      this._lines = options.lines
      this._zr = Zrender.init(options.el)
      this.mode = options.mode
      this._onNodeSelected = options.onNodeSelected
      this._onLineSelected = options.onLineSelected

      this._el.style.backgroundColor = BoxConfig.wallpaperColor
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
        name: param.name || '未命名' + this._tempName++,
        mode: this.mode,
        selectChange: this._onNodeClick.bind(this),
        move: this._onNodeMove.bind(this),
        onCreateLine: this._onCreateLine.bind(this),
        onMoveLine: this._onMoveLine.bind(this),
        onEndLine: this._onEndLine.bind(this),
        z: this._boxList.length
      }

      options.x = options.x + options.width / 2
      options.y = options.y + options.height / 2
      const node = new NodeBox(options)
      this._zr.add(node)
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
        this._tempNode.resize(
          position.x - this._tempNode.width / 2, position.y - this._tempNode.height / 2,
          this._tempNode.width, this._tempNode.height)
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
        this._zr.remove(this._tempNode)
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
          from: line.from,
          to: line.to,
          path: line.path
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
      for (let i = 0; i < this._lineList.length; i++) {
        this._zr.remove(this._lineList[i])
      }
      if (this._tempLine) {
        this._zr.remove(this._tempLine)
      }
      // 清除节点
      for (let i = 0; i < this._boxList.length; i++) {
        this._zr.remove(this._boxList[i])
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
      this._zr.on('click', (e) => {
        console.dir(e.offsetX + '-' + e.offsetY)
        if (!e.target) {
          this._resizeBox.hide()
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
      for (let i = 0; i < this._nodes.length; i++) {
        const nodeData = this._nodes[i]
        const opt2 = {
          mode: this.mode,
          selectChange: this._onNodeClick.bind(this),
          move: this._onNodeMove.bind(this),
          onCreateLine: this._onCreateLine.bind(this),
          onMoveLine: this._onMoveLine.bind(this),
          onEndLine: this._onEndLine.bind(this)
        }
        Object.assign(opt2, nodeData)
        opt2.z = i + 1
        const nodeBox = new NodeBox(opt2)
        this._zr.add(nodeBox)
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
        if (inBox(position, this._boxList[i]) &&
                (box === null || this._boxList[i].z1 > box.z1)) {
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
      this._zr.add(line)
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
    _onMoveLine(startBox, startDirection,
      position,
      endBox, endDirection) {
      if (this._tempLine == null) return
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
        this._zr.remove(this._tempLine)
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

    _onLineClick(event, line) {
      for (let i = 0; i < this._lineList.length; i++) {
        this._lineList[i].selected(false)
      }
      if (line) {
        line.selected(true)
        this._onNodeClick(null)
        this._onNodeSelected(event, line, line ? {
          from: line.from,
          to: line.to,
          path: line.path
        } : null)
      }
      this.selectedLine = line || null
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
      this._zr.add(resizeBox)
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
     * @private
     */
    _redrawLineWhenBoxChange(box) {
      for (let i = 0; i < this._lineList.length; i++) {
        const line = this._lineList[i]
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
      for (let i = 0; i < this._boxList.length; i++) {
        if (this._boxList[i].name === name) {
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
      this._zr.remove(box)
      this._resizeBox.hide()
      // 删除节点相关连线
      this._lineList = this._lineList.filter((line) => {
        if (line.from.name === box.name || line.to.name === box.name) {
          this._zr.remove(line)
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
      this._zr.remove(line)
    }

    /**
     * 切换模式
     * @param {WorkbenchMode} mode
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
        this._lines[i].workbench = this
        const line = new Line({
          path: this._lines[i].path,
          from: this._lines[i].from,
          to: this._lines[i].to,
          state: this._lines[i].state,
          workbench: this,
          mode: this.mode,
          clickCallback: this._onLineClick.bind(this)
        })
        this._lineList.push(line)
        this._zr.add(line)
      }
    }
}

export default Workbench
