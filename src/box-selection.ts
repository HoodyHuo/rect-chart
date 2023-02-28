import { WorkbenchMode, ZLevel } from './shape/Const'
import { Direction } from './orth/Constant'
import { Group, ZRenderType, Rect } from 'zrender'
import { alignNodes, boxContain,getBoundingRect } from './util'
import Workbench from './workbench'
import NodeBox from './shape/NodeBox'
import ScaleHelper from './scale-helper'

/**
 * 框选处理辅助对象，
 * 帮助工作台完成框选及框选移动相关事件
 */
class BoxSelection {
  _zr: ZRenderType// zrender 实例

  _workbench: Workbench// 工作台实例
  _scaleTool: ScaleHelper

  _selectRect: Rect // 框选图形（展示用）
  _selectedGroup: Group// 框选到的元素统一加入此group
  _tempMoving: number[] = [0, 0] // 用于临时记录拖动量，操作完毕后清除

  selectedBoxList: NodeBox[] = []

  _selectDoneCallback: (arg1: NodeBox[]) => void// 框选完毕回调

  /**
   * 构造函数
   * @param zr 实例
   * @param wb 工作台
   * @param scaleTool 缩放器
   * @param onSelected 选择判定后的回调事件
   */
  constructor(zr: ZRenderType, wb: Workbench, scaleTool: ScaleHelper, onSelected: (arg1: NodeBox[]) => void) {
    this._zr = zr
    this._workbench = wb
    this._scaleTool = scaleTool
    this._selectDoneCallback = onSelected
    // 创建框选范围展示shape
    this._selectRect = this._makeSelectRect()
    this._scaleTool.add(this._selectRect) 

    this._selectedGroup = new Group({
      draggable: false
    })
    this._bindingMouseEvent()
  }

  /**
   * 1.根据框选范围计算被覆盖节点
   * 2. 绘制整体操作组件
   * 3. 触发工作台框选完成监听
   * @param p
   * @param p.x 起点x
   * @param p.y 起点y
   * @param p.width 宽
   * @param p.height 高
   * @private
   * 
   *///@ts-ignore
  _handleSelectRect({ x, y, width, height }) {
    this.selectedBoxList = []
    for (let i = 0; i < this._workbench._boxList.length; i++) {
      if (boxContain({ x, y, width, height }, this._workbench._boxList[i])) {
        this.selectedBoxList.push(this._workbench._boxList[i])
        // this._selectedGroup.add(this._workbench._boxList[i])
      }
    }

    const rect = getBoundingRect(this.selectedBoxList)
    console.log(rect)
    this.updateRectPosition(rect.x, rect.y, rect.width, rect.height)
    // 通知workbench，处理选择完成
    if (typeof this._selectDoneCallback === 'function') {
      this._selectDoneCallback(this.selectedBoxList)
    }
  }

  /**
   * 清除组内元素，并归位选择框
   */
  reset() {
    this._selectedGroup.removeAll()
    this.updateRectPosition(0, 0, 0, 0)
  }

  /**
   * 创建选择框图形
   * @returns {Rect}
   * @private
   */
  _makeSelectRect() {
    return new Rect({
      draggable: true,
      zlevel: ZLevel.SELECT_VIEW,
      style: {
        opacity: 0.3,
        fill: '#8f8ccb',
        stroke: '#8f8ccb'
      },
      shape: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      },
      ondrag: (event) => {
        // TODO 批量处理移动 性能难过
        const v = [event.target.x - this._tempMoving[0],
        event.target.y - this._tempMoving[1]]
        this._handleSelectedMove(v)
        this._tempMoving = [event.target.x, event.target.y]
      },
      //@ts-ignore 扩充字段，给右键处理器
      menus: [
        { text: '左对齐', callback: () => { this.algin(Direction.LEFT) } },
        { text: '右对齐', callback: () => { this.algin(Direction.RIGHT) } },
        { text: '上对齐', callback: () => { this.algin(Direction.TOP) } },
        { text: '下对齐', callback: () => { this.algin(Direction.BOTTOM) } },
        { text: '删除', callback: () => { this.deleteSelected() } }

      ]
    })
  }

  /**
   * 绑定鼠标事件
   * @private
   */
  _bindingMouseEvent() {
    // 移动过程中，保持选择区域调整大小
    const mousemove = (zrEvent: { offsetX: number; offsetY: number }) => {
      console.log("mousemove")
      const xy = this._scaleTool.transformCoordToLocal(zrEvent.offsetX, zrEvent.offsetY)
      this._selectRect.shape.width = xy[0] - this._selectRect.x
      this._selectRect.shape.height = xy[1] - this._selectRect.y
      this._selectRect.dirty()
    }
    // 鼠标抬起后，1. 计算框选范围 2.清理过程事件监听 3.触发框选完成
    const mouseUP = (_zrEvent: any) => {
      console.log("mouseUP")
      const shape = {
        x: this._selectRect.x,
        y: this._selectRect.y,
        width: this._selectRect.shape.width,
        height: this._selectRect.shape.height
      } // 拷贝
      // 规整负数高宽
      if (shape.height < 0) {
        shape.y = shape.y + shape.height
        shape.height = Math.abs(shape.height)
      }
      if (shape.width < 0) {
        shape.x = shape.x + shape.width
        shape.width = Math.abs(shape.width)
      }
      // 清理事件监听，重置框选图形对象
      this._zr.off('mousemove', mousemove)
      this._zr.off('mouseup', mouseUP)
      // 处理框选
      this._handleSelectRect(shape)
    }

    this._zr.on('mousedown', (zrEvent) => {
      console.log("mouseDown")
      if (this._workbench.mode === WorkbenchMode.VIEW || zrEvent.target === this._selectRect) {
        return
      }
      if (zrEvent.target || zrEvent.topTarget) return
      this.reset()
     
      const xy = this._scaleTool.transformCoordToLocal(zrEvent.offsetX, zrEvent.offsetY)
      this.updateRectPosition(xy[0],xy[1], 0, 0)
      this._zr.on('mousemove', mousemove)
      this._zr.on('mouseup', mouseUP)
    })
  }

  /**
   * 更新展示Rect的位置和大小,
   * 采用图形的x,y作为坐标，shape的xy保持为0
   * @param x
   * @param y
   * @param w
   * @param h
   */
  updateRectPosition(x: number, y: number, w: number, h: number) {
    this._selectRect.shape = {
      x: 0,
      y: 0,
      width: w,
      height: h
    }
    this._selectRect.x = x
    this._selectRect.y = y
    this._tempMoving = [x, y] // 设置临时位置，用于计算移动

    this._selectRect.dirty()
  }

  /**
   * 移动当前选中的范围内包含的node
   * @param {number[]} v 移动向量
   * @private
   */
  _handleSelectedMove(v: number[]) {
    const children =this.selectedBoxList
    for (let i = 0; i < children.length; i++) {
      const node = children[i]
      node.resize(node.x + v[0], node.y + v[1], node.width, node.height)
      this._workbench._redrawLineWhenBoxChange(children[i])
    }
  }

  /**
   * 对齐
   * @param {number} direction 方向
   */
  algin(direction: String) {
    alignNodes(this.selectedBoxList, direction)
    for (let i = 0; i < this.selectedBoxList.length; i++) {
      this._workbench._redrawLineWhenBoxChange(this.selectedBoxList[i])
    }
  }

  /**
   * 删除选中的节点
   */
  deleteSelected() {
    for (let i = 0; i < this.selectedBoxList.length; i++) {
      this._workbench.removeBox(this.selectedBoxList[i])
    }
  }
}

export default BoxSelection
