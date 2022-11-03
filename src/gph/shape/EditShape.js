const zrender = require('zrender')

const circleOptions = {

}

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

    isVisible // 是否显示

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
        shape: {
          cx: this.x,
          cy: this.y,
          r: 5
        },
        style: {
          fill: 'transparent',
          stroke: '#FF6EBE'
        },
        draggable: true,
        ondrag: (evnet) => {
          this.handlePointDrag(evnet, 'leftTop')
        }
      }

      Object.assign(leftTopPointConfig, circleOptions)
      this.leftTopPoint = new zrender.Circle(leftTopPointConfig)

      this.add(this.leftTopPoint)
    }

    handlePointDrag(event, target) {
      console.log(event.offsetX, event.offsetY)
      event.stop()
      console.dir(event)
      this.onSizeChange({ x: event.offsetX, y: event.offsetY }, target)
    }
}

export default EditShape
