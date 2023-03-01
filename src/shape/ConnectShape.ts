import { Direction } from '../orth/Constant'

import { Group, ZRenderType, Circle } from 'zrender'
import Config from '../Config'
import { ZLevel } from './Const'

import NodeBox from './NodeBox'

const ConnectBox = Config.ConnectBox

/** 连线起点通用zrender配置 */
const circleOptions = {
  cursor: 'crosshair',
  zlevel: ZLevel.NODE,
  shape: {
    r: ConnectBox.circleSize,
  },
  style: {
    fill: ConnectBox.circleFill,
    stroke: ConnectBox.circleStroke,
  },
  draggable: true,
}

/**
 * 拖拽连线 图形层
 */
class ConnectShape extends Group {
  // 拖拽点
  pointers: Map<string, Circle> = new Map // Map<Direction, Circle>

  width: number
  height: number
  z!:number

  box: NodeBox

  isVisible: boolean = true // 是否显示

  onCreateLine
  onMoveLine
  onEndLine

  /**
   * 构造函数
   * @param {number} options.x X
   * @param {number} options.y Y
   * @param {number} options.z Z
   * @param {number} options.z2
   * @param {number} options.box parent
   * @param {number} options.width 宽
   * @param {number} options.height 高
   * @param {function} options.onCreateLine workbench监听连线创建事件
   * @param {function} options.onMoveLine 连线创建过程中，尾部移动时间
   * @param {function} options.onEndLine  workbench监听连线创建完成事件
   * @constructor
   */
  constructor(options: any) {
    super(options)
    this.width = options.width
    this.height = options.height
    this.box = options.box

    this.onCreateLine = options.onCreateLine
    this.onMoveLine = options.onMoveLine
    this.onEndLine = options.onEndLine
    this.createHandlePoints()
  }

  /**
   * 创建连线上下左右4个连接启动点
   */
  createHandlePoints() {
    /** 顶部 */
    const topPointConfig = {
      z1: this.z,
      x: this.width / 2,
      y: 0,
      ondragstart: (evnet: any) => {
        this._createLine(evnet, Direction.TOP)
      },
      ondrag: (evnet: any) => {
        this._moving(evnet, Direction.TOP)
      },
      ondragend: (event: any) => {
        this._createEnd(event)
      },
    }
    Object.assign(topPointConfig, circleOptions)
    this.pointers.set(Direction.TOP, new Circle(topPointConfig))

    /** 底部 */
    const bottomPointConfig = {
      z1: this.z,
      x: this.width / 2,
      y: this.height,
      ondragstart: (event: any) => {
        this._createLine(event, Direction.BOTTOM)
      },
      ondrag: (event: any) => {
        this._moving(event, Direction.BOTTOM)
      },
      ondragend: (event: any) => {
        this._createEnd(event)
      },
    }
    Object.assign(bottomPointConfig, circleOptions)
    this.pointers.set(Direction.BOTTOM, new Circle(bottomPointConfig))

    /** 左侧 */
    const leftPointConfig = {
      z1: this.z,
      x: 0,
      y: this.height / 2,
      ondragstart: (event: any) => {
        this._createLine(event, Direction.LEFT)
      },
      ondrag: (event: any) => {
        this._moving(event, Direction.LEFT)
      },
      ondragend: (event: any) => {
        this._createEnd(event)
      },
    }
    Object.assign(leftPointConfig, circleOptions)
    this.pointers.set(Direction.LEFT, new Circle(leftPointConfig))

    /** 右侧 */
    const rightPointConfig = {
      z1: this.z,
      x: this.width,
      y: this.height / 2,
      ondragstart: (event: any) => {
        this._createLine(event, Direction.RIGHT)
      },
      ondrag: (event: any) => {
        this._moving(event, Direction.RIGHT)
      },
      ondragend: (event: any) => {
        this._createEnd(event)
      },
    }
    Object.assign(rightPointConfig, circleOptions)
    this.pointers.set(Direction.RIGHT, new Circle(rightPointConfig))

    this.pointers.forEach((point, _key) => {
      this.add(point)
    })

  }

  /**
   * 触发连线创建，准备参数，通知workbench
   * @param event
   * @param direction
   * @private
   */
  _createLine(event: any, direction: string) {
    event.tragger = this.box
    event.direction = direction

    this.onCreateLine(this.box, direction, { x: event.offsetX, y: event.offsetY })

    event.stop()
  }

  /**
   * 触发连线创建过程中，尾部移动事件，准备参数，通知workbench
   * @param event
   * @param direction
   * @private
   */
  _moving(event: any, direction: string) {
    /** 阻止时间冒泡 */
    event.stop()
    /** 设置连接点位置，防止飘逸 */
    this.resize(this.width, this.height)
    
    /** 通知workbench */
    this.onMoveLine(this.box, direction, event)
  }

  /**
   * 放开鼠标，连线完成
   * @param event
   * @private
   */
  _createEnd(event: any) {
    this.onEndLine(event)
  }

  /**
   * 重设当前盒子各个连接点位置
   * @param width 节点实例宽度
   * @param height 节点实例高度
   */
  resize(width: number, height: number) {
    this.height = height
    this.width = width
    this.x = 0
    this.y = 0

    const topPoint = this.pointers.get(Direction.TOP) as Circle
    topPoint.x = this.width / 2
    topPoint.y = 0

    const bottomPoint = this.pointers.get(Direction.BOTTOM) as Circle
    bottomPoint.x = this.width / 2
    bottomPoint.y = this.height

    const leftPoint = this.pointers.get(Direction.LEFT) as Circle
    leftPoint.y = this.height / 2
    leftPoint.x = 0

    const rightPoint = this.pointers.get(Direction.RIGHT) as Circle
    rightPoint.y = this.height / 2
    rightPoint.x = this.width

    this.dirty()
  }
}

export default ConnectShape
