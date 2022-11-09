const zrender = require('zrender')
import config from '../BoxConfig'
const BoxBorder = config.BoxBorder

class ViewBackgroundShape extends zrender.Path {
    selectedAnimate = null
    Type = 'ViewBackgroundShape'

    constructor(options) {
      options.draggable = false
      options.style.fill = config.backgroundColor[(options.state || 'default')]
      options.style.lineWidth = BoxBorder.lineWidth
      options.style.strokeNoScale = true
      options.style.stroke = BoxBorder.color

      // eslint-disable-next-line no-debugger
      super(options)
      this.state = options.state || 'default'
      this.name = options.name
    }

    // eslint-disable-next-line no-unused-vars
    buildPath(ctx, shapeCfg, inBatch) {
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x + this.width, this.y)
      ctx.lineTo(this.x + this.width, this.y + this.height)
      ctx.lineTo(this.x, this.y + this.height)
      ctx.lineTo(this.x, this.y)
    }

    getFillColor() {
      return config.backgroundColor[this.state] || config.backgroundColor['default']
    }
    updateState(state) {
      this.state = state
      this.options.style.fill = this.getFillColor()
      this.dirty()
    }

    setSelected(selected) {
      const style = this.style
      style.stroke = selected ? BoxBorder.colorSelected : BoxBorder.color
      style.lineDash = selected ? [10] : false
      if (selected && this.selectedAnimate === null) {
        this.selectedAnimate = setInterval(() => {
          if (style.lineDashOffset === 20) {
            style.lineDashOffset = 1
          } else {
            style.lineDashOffset++
          }
          this.attr('style', style)
        }, BoxBorder.speed)
      } else {
        clearInterval(this.selectedAnimate)
        this.selectedAnimate = null
      }
      this.attr('style', style)
    }
    resize(x, y, width, height) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
      this.dirty()
    }
}

export default ViewBackgroundShape
