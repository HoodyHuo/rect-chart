const zrender = require('zrender')
import config from '../BoxConfig'
const BoxBorder = config.BoxBorder

class ViewBackgroundShape extends zrender.Path {
    selectedAnimate = null
    constructor(options) {
      options.draggable = false
      options.style.fill = config.backgroundColor.linearColor
      options.style.lineWidth = BoxBorder.lineWidth
      options.style.strokeNoScale = true
      options.style.stroke = BoxBorder.color

      // eslint-disable-next-line no-debugger
      super(options)
      this.state = 'normal'
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
      switch (this.state) {
        case 'normal':
          return config.backgroundColor.linearColor
        case 'error':
          return config.backgroundColor.errColor
        default:
          return config.backgroundColor.linearColor
      }
    }
    setState(state) {
      this.state = state
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
}

export default ViewBackgroundShape
