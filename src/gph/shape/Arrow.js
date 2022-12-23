import { Direction } from '../orth/Constant'
import Config from '../Config'
import { ZLevel } from './Const'

const LineConfig = Config.Line

const zrender = require('zrender')

/**
 * 箭头图形
 */
class Arrow extends zrender.Path {
    shape = {
      size: LineConfig.ArrowSize,
      direction: Direction.TOP,
      x: 0,
      y: 0
    }

    /**
     *
     * @param opts
     * @param opts.style.stroke
     * @param opts.style.fill
     * @param opts.shape
     * @param {number} opts.shape.x
     * @param {number} opts.shape.y
     * @param {Direction} opts.shape.direction
     */
    constructor(opts) {
      opts.shape.size = opts.shape.size || LineConfig.ArrowSize
      opts.zlevel = ZLevel.LINE
      opts.style.lineWidth = 1
      super(opts)
      this.shape = opts.shape
    }

    /**
     *
     * @param {PathProxy | CanvasRenderingContext2D} ctx
     * @param  {Dictionary<any>} shapeCfg
     * @param {number} shapeCfg.x
     * @param {number} shapeCfg.y
     * @param {number} shapeCfg.size
     * @param {Direction} shapeCfg.direction
     * @param {boolean} inBatch
     */
    buildPath(ctx, shapeCfg, inBatch) {
      ctx.moveTo(shapeCfg.x, shapeCfg.y)
      switch (shapeCfg.direction) {
        case Direction.TOP:
          ctx.lineTo(shapeCfg.x - shapeCfg.size / 2,
            shapeCfg.y + shapeCfg.size)
          ctx.lineTo(shapeCfg.x,
            shapeCfg.y + shapeCfg.size / 5 * 3)
          ctx.lineTo(shapeCfg.x + shapeCfg.size / 2,
            shapeCfg.y + shapeCfg.size)
          break
        case Direction.BOTTOM:
          ctx.lineTo(shapeCfg.x - shapeCfg.size / 2,
            shapeCfg.y - shapeCfg.size)
          ctx.lineTo(shapeCfg.x,
            shapeCfg.y - shapeCfg.size / 5 * 3)
          ctx.lineTo(shapeCfg.x + shapeCfg.size / 2,
            shapeCfg.y - shapeCfg.size)
          break
        case Direction.LEFT:
          ctx.lineTo(shapeCfg.x + shapeCfg.size,
            shapeCfg.y - shapeCfg.size / 2)
          ctx.lineTo(shapeCfg.x + shapeCfg.size / 5 * 3,
            shapeCfg.y)
          ctx.lineTo(shapeCfg.x + shapeCfg.size,
            shapeCfg.y + shapeCfg.size / 2)
          break
        case Direction.RIGHT:
          ctx.lineTo(shapeCfg.x - shapeCfg.size,
            shapeCfg.y - shapeCfg.size / 2)
          ctx.lineTo(shapeCfg.x - shapeCfg.size / 5 * 3,
            shapeCfg.y)
          ctx.lineTo(shapeCfg.x - shapeCfg.size,
            shapeCfg.y + shapeCfg.size / 2)
          break
      }
      ctx.lineTo(shapeCfg.x, shapeCfg.y)
    }

    /**
     * zrender color
     * @param color
     */
    updateColor(color) {
      this.style.stroke = color
      this.style.fill = color
      this.dirty()
    }

    /**
     *
     * @param {{x:number,y:number}} pos
     * @param {Direction} dir
     */
    updatePosition({ x, y }, dir) {
      this.shape.x = x
      this.shape.y = y
      this.shape.direction = dir
      this.dirty()
    }
}

export default Arrow
