const zrender = require('zrender')
import BoxConfig from '../BoxConfig'
const LineConfig = BoxConfig.Line

/**
 * 连线绘制图层
 */
class LinePath extends zrender.Path {
  data

  constructor(options) {
    options.draggable = false
    options.zlevel = 10
    options.style = {}
    options.style.fill = null
    options.style.lineWidth = LineConfig.lineWidth
    options.style.strokeNoScale = true
    options.style.stroke = LineConfig.color
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
    }, 20)
  }

  buildPath(ctx, shapeCfg, inBatch) {
    // super.buildPath(ctx, shapeCfg, inBatch)
    const path = this.data
    ctx.moveTo(path[0].x, path[0].y)
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y)
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
}

export default LinePath
