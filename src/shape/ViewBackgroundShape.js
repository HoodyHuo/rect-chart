const zrender = require('zrender')
import config from '../Config'
const BoxBorder = config.BoxBorder
const NodeColor = config.NodeColor

const _getColor = (state) => {
  return NodeColor[state] || NodeColor['default']
}
/**
 * 节点 背景图层
 */
class ViewBackgroundShape extends zrender.Path {
  selectedAnimate = null
  Type = 'ViewBackgroundShape'

  constructor(options) {
    options.draggable = false
    const colorConfig = _getColor(options.state)
    options.style.fill = colorConfig.background
    options.style.lineWidth = BoxBorder.lineWidth
    options.style.strokeNoScale = true
    options.style.stroke = colorConfig.border

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

  updateState(state) {
    this.state = state
    const color = _getColor(state)
    this.options.style.fill = color.background
    this.options.style.stroke = color.border
    this.dirty()
  }

  setSelected(selected) {
    const style = this.style
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
