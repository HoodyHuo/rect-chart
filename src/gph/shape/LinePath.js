const zrender = require('zrender')
import BoxConfig from '../Config'
const LineConfig = BoxConfig.Line

/**
 * 连线绘制图层
 */
class LinePath extends zrender.Path {
  data

  constructor(options) {
    options.draggable = false
    options.zlevel = 10
    options.style.fill = null
    options.style.lineWidth = LineConfig.lineWidth
    options.style.strokeNoScale = true
    options.style.lineDash = 8
    super(options)
    this.data = options.data

    setInterval(() => {
      if (this.style.lineDashOffset === 1) {
        this.style.lineDashOffset = 16
      } else {
        this.style.lineDashOffset--
      }
      this.dirty()
    }, LineConfig.lineSpeed)
  }

  buildPath(ctx, shapeCfg, inBatch) {
    // super.buildPath(ctx, shapeCfg, inBatch)
    const path = this.data
    if (!path) return
    ctx.moveTo(path[0][0], path[0][1])
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i][0], path[i][1])
    }
  }

  /**
   *
   * @param {number[]} path
   */
  updatePath(path) {
    this.attr('data', path)
    this.dirty()
  }

  /**
   * zrender color
   * @param color
   */
  updateColor(color) {
    this.style.stroke = color
    this.dirty()
  }
}

export default LinePath
