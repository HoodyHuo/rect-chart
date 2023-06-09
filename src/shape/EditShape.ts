import { ZLevel } from '../shape/Const'

import {Group,Circle, GroupProps} from 'zrender'
// eslint-disable-next-line no-unused-vars
import Config from '../Config'
import NodeBox from './NodeBox'
import ScaleHelper from '../scale-helper'
const EditBox = Config.EditBox

/** 尺寸调整控件统一参数 */
const circleOptions = {
  zlevel: ZLevel.NODE,
  shape: {
    r: EditBox.circleSize,
  },
  style: {
    fill: EditBox.circleFill,
    stroke: EditBox.circleStroke,
  },
  draggable: true,
}

/** 各节点位置名称 */
const positionKey = {
  leftTop: 'left-top',
  centerTop: 'center-top',
  rightTop: 'right-top',
  rightCenter: 'right-center',
  rightBottom: 'right-bottom',
  centerBottom: 'center-bottom',
  leftBottom: 'left-bottom',
  leftCenter: 'left-center',
}

/**
 * 尺寸调整图形层
 */
class EditShape extends Group {
  // 拖拽点
  leftTopPoint!: Circle // 左上
  centerTopPoint!: Circle  // 中上
  rightTopPoint !: Circle // 右上
  rightCenterPoint!: Circle  // 右边中间
  rightBottomPoint !: Circle // 右下
  centerBottomPoint !: Circle // 中间下方
  leftBottomPoint !: Circle // 左下
  leftCenterPoint !: Circle // 左边中间

  x!: number
  y!: number
  width!: number
  height!: number

  targetOrigin = {
    x: 0,
    y: 0,
    width:0,
    height: 0,
  }

  isVisible :boolean = false// 是否显示

  parentBox :NodeBox|null = null
  scaleTool: ScaleHelper
  onSizeChange: any 
  /**
   * @param {number} options.x X
   * @param {number} options.y Y
   * @param {number} options.width 宽
   * @param {number} options.height 高
   * @param {function} options.onSizeChange
   * @constructor
   */
  constructor(options: any) {
    super(options)
    this.onSizeChange = options.onSizeChange
    this.scaleTool = options.scaleTool
    this.createHandlePoints()
  }

  /**
   * 创建拖拽点
   */
  createHandlePoints() {
    // 左上方
    const leftTopPointConfig = {
      cursor: 'nw-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.leftTop)
      },
    }
    Object.assign(leftTopPointConfig, circleOptions)
    this.leftTopPoint = new Circle(leftTopPointConfig)
    this.add(this.leftTopPoint)

    // 正上方
    const centerTopPointConfig = {
      cursor: 'n-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.centerTop)
      },
    }
    Object.assign(centerTopPointConfig, circleOptions)
    this.centerTopPoint = new Circle(centerTopPointConfig)
    // this.add(this.centerTopPoint)

    // 右上方
    const rightTopPointConfig = {
      cursor: 'ne-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.rightTop)
      },
    }
    Object.assign(rightTopPointConfig, circleOptions)
    this.rightTopPoint = new Circle(rightTopPointConfig)
    this.add(this.rightTopPoint)

    // 正右侧
    const rightCenterPointConfig = {
      cursor: 'e-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.rightCenter)
      },
    }
    Object.assign(rightCenterPointConfig, circleOptions)
    this.rightCenterPoint = new Circle(rightCenterPointConfig)
    // this.add(this.rightCenterPoint)

    // 右下方
    const rightBottomPointConfig = {
      cursor: 'se-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.rightBottom)
      },
    }
    Object.assign(rightBottomPointConfig, circleOptions)
    this.rightBottomPoint = new Circle(rightBottomPointConfig)
    this.add(this.rightBottomPoint)

    // 正下方
    const centerBottomConfig = {
      cursor: 's-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.centerBottom)
      },
    }
    Object.assign(centerBottomConfig, circleOptions)
    this.centerBottomPoint = new Circle(centerBottomConfig)
    // this.add(this.centerBottomPoint)

    // 左下方
    const leftBottomConfig = {
      cursor: 'sw-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.leftBottom)
      },
    }
    Object.assign(leftBottomConfig, circleOptions)
    this.leftBottomPoint = new Circle(leftBottomConfig)
    this.add(this.leftBottomPoint)

    // 正左侧
    const leftCenterConfig = {
      cursor: 'w-resize',
      ondragstart: this._memTargetState.bind(this),
      ondrag: (evnet: any) => {
        this._handlePointDrag(evnet, positionKey.leftCenter)
      },
    }
    Object.assign(leftCenterConfig, circleOptions)
    this.leftCenterPoint = new Circle(leftCenterConfig)
    // this.add(this.leftCenterPoint)
  }

  /**
   * 处理尺寸拖拽事件
   * @param event  zrender event
   * @param target 拖拽的那个点
   * @private
   */
  _handlePointDrag(event: { stop: () => void; offsetX: any; offsetY: any }, target: string) {
    if(!this.parentBox){
      return
    }
    event.stop()
    // 记录参数
    const xy = this.scaleTool.transformCoordToLocal(event.offsetX,event.offsetY)
    const eX = xy[0]
    const eY = xy[1]
    const x = this.targetOrigin.x
    const y = this.targetOrigin.y
    const width = this.targetOrigin.width
    const height = this.targetOrigin.height

    // 根据当给拖拽位置决定节点移动到什么状态
    switch (target) {
      case positionKey.leftTop:
        this.parentBox.resize(eX, eY, Math.abs(x + width - eX), Math.abs(y + height - eY))
        break
      case positionKey.centerTop:
        this.parentBox.resize(x, eY, width, Math.abs(y + height - eY))
        break
      case positionKey.rightTop:
        this.parentBox.resize(x, eY, Math.abs(eX - x), y + height - eY)
        break
      case positionKey.rightCenter:
        this.parentBox.resize(x, y, eX - x, height)
        break
      case positionKey.rightBottom:
        this.parentBox.resize(x, y, Math.abs(eX - x), Math.abs(eY - y))
        break
      case positionKey.centerBottom:
        this.parentBox.resize(x, y, width, Math.abs(eY - y))
        break
      case positionKey.leftBottom:
        this.parentBox.resize(eX, y, Math.abs(x + width - eX), Math.abs(eY - y))
        break
      case positionKey.leftCenter:
        this.parentBox.resize(eX, y, Math.abs(x + width - eX), height)
        break
    }
    // 将自己移动到盒子的位置
    this._moveToBox(this.parentBox)
    // 通知workbench 盒子尺寸变化
    this.onSizeChange(this.parentBox)
  }
  /**
   * Handle resizeBox show
   * @param { Nodebox } box
   * 
   *///@ts-ignore
  show(box: NodeBox | null ):void {
    if (!box) return
    this.parentBox = box
    super.show()
    this._moveToBox(box)
  }
  hide() {
    super.hide()
  }
  /**
   * 移动尺寸编辑器到节点实例的位置覆盖
   * @param { Nodebox } box
   * @private
   */
  _moveToBox(box: NodeBox) {
    this.leftTopPoint.attr('x', box.x)
    this.leftTopPoint.attr('y', box.y)

    this.centerTopPoint.attr('x', box.x + box.width / 2)
    this.centerTopPoint.attr('y', box.y)

    this.rightTopPoint.attr('x', box.x + box.width)
    this.rightTopPoint.attr('y', box.y)

    this.rightCenterPoint.attr('x', box.x + box.width)
    this.rightCenterPoint.attr('y', box.y + box.height / 2)

    this.rightBottomPoint.attr('x', box.x + box.width)
    this.rightBottomPoint.attr('y', box.y + box.height)

    this.centerBottomPoint.attr('x', box.x + box.width / 2)
    this.centerBottomPoint.attr('y', box.y + box.height)

    this.leftBottomPoint.attr('x', box.x)
    this.leftBottomPoint.attr('y', box.y + box.height)

    this.leftCenterPoint.attr('x', box.x)
    this.leftCenterPoint.attr('y', box.y + box.height / 2)
  }

  /**
   * 临时保存节点实例的位置、尺寸信息
   * @private
   */
  _memTargetState() {
    if(!this.parentBox){
      return
    }
    this.targetOrigin = {
      x: this.parentBox.x,
      y: this.parentBox.y,
      width: this.parentBox.width,
      height: this.parentBox.height,
    }
  }
}

export default EditShape
