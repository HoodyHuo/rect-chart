const zrender = require('zrender')
// eslint-disable-next-line no-unused-vars
import Nodebox from '../NodeBox'
import Config from '../BoxConfig'
const EditBox = Config.EditBox
const circleOptions = {
  zlevel: 10,
  shape: {
    r: EditBox.circleSize
  },
  style: {
    // fill: 'transparent',
    stroke: EditBox.circleColor
  },
  draggable: true
}

const positionKey = {
  leftTop: 'left-top',
  centerTop: 'center-top',
  rightTop: 'right-top',
  rightCenter: 'right-center',
  rightBottom: 'right-bottom',
  centerBottom: 'center-bottom',
  leftBottom: 'left-bottom',
  leftCenter: 'left-center'
}

/**
 * 尺寸调整图形层
 */
class EditShape extends zrender.Group {
    // 拖拽点
    leftTopPoint // 左上
    centerTopPoint // 中上
    rightTopPoint // 右上
    rightCenterPoint // 右边中间
    rightBottomPoint // 右下
    centerBottomPoint // 中间下方
    leftBottomPoint // 左下
    leftCenterPoint // 左边中间

    x
    y
    width
    height

    isVisible // 是否显示

    target
    onSizeChange
    /**
     * @param {number} options.x X
     * @param {number} options.y Y
     * @param {number} options.width 宽
     * @param {number} options.height 高
     * @param {function} options.onSizeChange
     * @constructor
     */
    constructor(options) {
      super(options)
      this.onSizeChange = options.onSizeChange
      this.createHandlePoints()
    }
    // eslint-disable-next-line
    setVisible(visible) {

    }

    createHandlePoints() {
      const leftTopPointConfig = {
        cursor: 'nw-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.leftTop)
        }
      }
      Object.assign(leftTopPointConfig, circleOptions)
      this.leftTopPoint = new zrender.Circle(leftTopPointConfig)
      this.add(this.leftTopPoint)

      const centerTopPointConfig = {
        cursor: 'n-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.centerTop)
        }
      }
      Object.assign(centerTopPointConfig, circleOptions)
      this.centerTopPoint = new zrender.Circle(centerTopPointConfig)
      // this.add(this.centerTopPoint)

      const rightTopPointConfig = {
        cursor: 'ne-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.rightTop)
        }
      }
      Object.assign(rightTopPointConfig, circleOptions)
      this.rightTopPoint = new zrender.Circle(rightTopPointConfig)
      this.add(this.rightTopPoint)

      const rightCenterPointConfig = {
        cursor: 'e-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.rightCenter)
        }
      }
      Object.assign(rightCenterPointConfig, circleOptions)
      this.rightCenterPoint = new zrender.Circle(rightCenterPointConfig)
      // this.add(this.rightCenterPoint)

      const rightBottomPointConfig = {
        cursor: 'se-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.rightBottom)
        }
      }
      Object.assign(rightBottomPointConfig, circleOptions)
      this.rightBottomPoint = new zrender.Circle(rightBottomPointConfig)
      this.add(this.rightBottomPoint)

      const centerBottomConfig = {
        cursor: 's-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.centerBottom)
        }
      }
      Object.assign(centerBottomConfig, circleOptions)
      this.centerBottomPoint = new zrender.Circle(centerBottomConfig)
      // this.add(this.centerBottomPoint)

      const leftBottomConfig = {
        cursor: 'sw-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.leftBottom)
        }
      }
      Object.assign(leftBottomConfig, circleOptions)
      this.leftBottomPoint = new zrender.Circle(leftBottomConfig)
      this.add(this.leftBottomPoint)

      const leftCenterConfig = {
        cursor: 'w-resize',
        ondragstart: this._memTargetState.bind(this),
        ondrag: (evnet) => {
          this._handlePointDrag(evnet, positionKey.leftCenter)
        }
      }
      Object.assign(leftCenterConfig, circleOptions)
      this.leftCenterPoint = new zrender.Circle(leftCenterConfig)
      // this.add(this.leftCenterPoint)
    }

    _handlePointDrag(event, target) {
      // console.log(event.offsetX, event.offsetY)
      event.stop()
      const eX = event.offsetX
      const eY = event.offsetY
      const x = this.targetOrigin.x
      const y = this.targetOrigin.y
      const width = this.targetOrigin.width
      const height = this.targetOrigin.height

      switch (target) {
        case positionKey.leftTop:
          this.target.resize(eX, eY,
            Math.abs(x + width - eX), Math.abs(y + height - eY))
          break
        case positionKey.centerTop:
          this.target.resize(x, eY, width, Math.abs(y + height - eY))
          break
        case positionKey.rightTop:
          this.target.resize(x, eY,
            Math.abs(eX - x), y + height - eY)
          break
        case positionKey.rightCenter:
          this.target.resize(x, y, eX - x, height)
          break
        case positionKey.rightBottom:
          this.target.resize(x, y, Math.abs(eX - x), Math.abs(eY - y))
          break
        case positionKey.centerBottom:
          this.target.resize(x, y, width, Math.abs(eY - y))
          break
        case positionKey.leftBottom:
          this.target.resize(eX, y,
            Math.abs(x + width - eX), Math.abs(eY - y))
          break
        case positionKey.leftCenter:
          this.target.resize(eX, y, Math.abs(x + width - eX), height)
          break
      }
      this._moveToBox(this.target)
      this.onSizeChange(this.target)
    }
    /**
     * Handle resizeBox show
     * @param { Nodebox } box
     */
    show(box) {
      this.target = box
      super.show()
      this._moveToBox(box)
    }

    hide() {
      super.hide()
    }

    /**
     *
     * @param { Nodebox } box
     * @private
     */
    _moveToBox(box) {
      this.leftTopPoint.attr('x', box.x)
      this.leftTopPoint.attr('y', box.y)

      this.centerTopPoint.attr('x', box.x + (box.width / 2))
      this.centerTopPoint.attr('y', box.y)

      this.rightTopPoint.attr('x', box.x + (box.width))
      this.rightTopPoint.attr('y', box.y)

      this.rightCenterPoint.attr('x', box.x + (box.width))
      this.rightCenterPoint.attr('y', box.y + box.height / 2)

      this.rightBottomPoint.attr('x', box.x + (box.width))
      this.rightBottomPoint.attr('y', box.y + box.height)

      this.centerBottomPoint.attr('x', box.x + (box.width / 2))
      this.centerBottomPoint.attr('y', box.y + box.height)

      this.leftBottomPoint.attr('x', box.x)
      this.leftBottomPoint.attr('y', box.y + box.height)

      this.leftCenterPoint.attr('x', box.x)
      this.leftCenterPoint.attr('y', box.y + box.height / 2)
    }
    _memTargetState() {
      this.targetOrigin = {
        x: this.target.x,
        y: this.target.y,
        width: this.target.width,
        height: this.target.height
      }
    }
}

export default EditShape
