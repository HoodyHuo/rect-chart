import { Direction } from '@/gph/orth/Constant'

const zrender = require('zrender')
// eslint-disable-next-line no-unused-vars
import Config from '../BoxConfig'
import { alignBorder } from '@/gph/shape/tool'
const ConnectBox = Config.ConnectBox
const circleOptions = {
  cursor: 'crosshair',
  zlevel: 10,
  shape: {
    r: ConnectBox.circleSize
  },
  style: {
    // fill: 'transparent',
    stroke: ConnectBox.circleColor
  },
  draggable: true
}

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
     * @param {number} options.x X
     * @param {number} options.y Y
     * @param {number} options.z Z
     * @param {number} options.z2
     * @param {number} options.box parent
     * @param {number} options.width 宽
     * @param {number} options.height 高
     * @param {function} options.onCreateLine
     * @param {function} options.onMoveLine
     * @param {function} options.onEndLine
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

    createHandlePoints() {
      const topPointConfig = {
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

      const bottomPointConfig = {
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

      const leftPointConfig = {
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

      const rightPointConfig = {
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

    _createLine(event, direction) {
      event.tragger = this.box
      event.direction = direction

      this.onCreateLine(this.box, direction, { x: event.offsetX, y: event.offsetY })

      event.stop()
    }

    _moving(event, direction) {
      event.stop()
      this.resize(this.width, this.height)
      const startBox = this.box
      let endBox = null
      let endDirection = null
      let position = { x: event.offsetX, y: event.offsetY }
      if (event.topTarget &&
          (event.topTarget.Type === 'ViewBackgroundShape')) {
        endBox = event.topTarget.parent
        const endAl = alignBorder({ x: event.offsetX, y: event.offsetY }, endBox)
        endDirection = endAl.direction
        position = endAl.pos
      }
      this.onMoveLine(
        startBox, direction,
        position,
        endBox, endDirection
      )
    }

    _createEnd(event) {
      this.onEndLine(event)
    }

    show() {
      super.show()
    }

    hide() {
      super.hide()
    }

    resize(width, height) {
      this.height = height
      this.width = width

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
