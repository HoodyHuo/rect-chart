import { Direction } from '../orth/Constant'

const zrender = require('zrender')
import Config from '../Config'
import { alignBorder } from './tool'
import { ZLevel } from './Const'
import { findParent } from '../util'

const ConnectBox = Config.ConnectBox

/** 连线起点通用zrender配置 */
const circleOptions = {
  cursor: 'crosshair',
  zlevel: ZLevel.NODE,
  shape: {
    r: ConnectBox.circleSize
  },
  style: {
    fill: ConnectBox.circleFill,
    stroke: ConnectBox.circleStroke
  },
  draggable: true
}

/**
 * 拖拽连线 图形层
 */
class ConnectShape extends zrender.Group {
    // 拖拽点
    pointers= {} // Map<Direction, zrender.Circle>

    width
    height

    box = null

    isVisible = true// 是否显示

    onCreateLine = null
    onMoveLine = null
    onEndLine= null

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
    constructor(options) {
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
        ondragstart: (evnet) => {
          this._createLine(evnet, Direction.TOP)
        },
        ondrag: (evnet) => {
          this._moving(evnet, Direction.TOP)
        },
        ondragend: (event) => {
          this._createEnd(event)
        }
      }
      Object.assign(topPointConfig, circleOptions)
      this.pointers[Direction.TOP] = new zrender.Circle(topPointConfig)

      /** 底部 */
      const bottomPointConfig = {
        z1: this.z,
        x: this.width / 2,
        y: this.height,
        ondragstart: (event) => {
          this._createLine(event, Direction.BOTTOM)
        },
        ondrag: (event) => {
          this._moving(event, Direction.BOTTOM)
        },
        ondragend: (event) => {
          this._createEnd(event)
        }
      }
      Object.assign(bottomPointConfig, circleOptions)
      this.pointers[Direction.BOTTOM] = new zrender.Circle(bottomPointConfig)

      /** 左侧 */
      const leftPointConfig = {
        z1: this.z,
        x: 0,
        y: this.height / 2,
        ondragstart: (event) => {
          this._createLine(event, Direction.LEFT)
        },
        ondrag: (event) => {
          this._moving(event, Direction.LEFT)
        },
        ondragend: (event) => {
          this._createEnd(event)
        }
      }
      Object.assign(leftPointConfig, circleOptions)
      this.pointers[Direction.LEFT] = new zrender.Circle(leftPointConfig)

      /** 右侧 */
      const rightPointConfig = {
        z1: this.z,
        x: this.width,
        y: this.height / 2,
        ondragstart: (event) => {
          this._createLine(event, Direction.RIGHT)
        },
        ondrag: (event) => {
          this._moving(event, Direction.RIGHT)
        },
        ondragend: (event) => {
          this._createEnd(event)
        }
      }
      Object.assign(rightPointConfig, circleOptions)
      this.pointers[Direction.RIGHT] = new zrender.Circle(rightPointConfig)

      for (const key in this.pointers) {
        this.add(this.pointers[key])
      }
    }

    /**
     * 触发连线创建，准备参数，通知workbench
     * @param event
     * @param direction
     * @private
     */
    _createLine(event, direction) {
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
    _moving(event, direction) {
      /** 阻止时间冒泡 */
      event.stop()
      /** 设置连接点位置，防止飘逸 */
      this.resize(this.width, this.height)
      /** 准备参数 */
      const startBox = this.box
      let endBox = null
      let endDirection = null
      let position = { x: event.offsetX, y: event.offsetY }
      /** 定位当前落在那个节点实例上 */
      if (event.topTarget) {
        endBox = findParent(event.topTarget)
        if (endBox !== null && endBox !== startBox) {
          const endAl = alignBorder({ x: event.offsetX, y: event.offsetY }, endBox)
          endDirection = endAl.direction
          position = endAl.pos
        }
      }
      /** 通知workbench */
      this.onMoveLine(
        startBox, direction,
        position,
        endBox !== startBox ? endBox : null, endDirection
      )
    }

    /**
   * 放开鼠标，连线完成
   * @param event
   * @private
   */
    _createEnd(event) {
      this.onEndLine(event)
    }

    /**
   * 重设当前盒子各个连接点位置
   * @param width 节点实例宽度
   * @param height 节点实例高度
   */
    resize(width, height) {
      this.height = height
      this.width = width
      this.x = 0
      this.y = 0

      this.pointers[Direction.TOP].x = this.width / 2
      this.pointers[Direction.TOP].y = 0

      this.pointers[Direction.BOTTOM].x = this.width / 2
      this.pointers[Direction.BOTTOM].y = this.height

      this.pointers[Direction.LEFT].y = this.height / 2
      this.pointers[Direction.LEFT].x = 0

      this.pointers[Direction.RIGHT].y = this.height / 2
      this.pointers[Direction.RIGHT].x = this.width

      this.dirty()
    }
}

export default ConnectShape
