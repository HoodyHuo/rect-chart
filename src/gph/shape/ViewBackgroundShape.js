const zrender = require('zrender')

// eslint-disable-next-line no-unused-vars
const linearColor = new zrender.LinearGradient(0, 0, 0, 1, [
  {
    offset: 0,
    color: '#efe3ff'
  },
  {
    offset: 1,
    color: '#6cb3e9'
  }
])

const errColor = new zrender.LinearGradient(0, 0, 0, 1, [
  {
    offset: 1,
    color: '#9a0851'
  },
  {
    offset: 0,
    color: '#244a7a'
  }
])

class ViewBackgroundShape extends zrender.Path {
    selectedAnimate = null
    constructor(options) {
      options.draggable = false
      options.style.fill = errColor
      options.style.lineWidth = 3
      options.style.strokeNoScale = true
      options.style.stroke = '#0d1e34'

      // eslint-disable-next-line no-debugger
      super(options)
      this.state = 'normal'
      this.name = options.name
    }

    // eslint-disable-next-line no-unused-vars
    buildPath(ctx, shapeCfg, inBatch) {
      ctx.fillStyle = this.getFillColor()
      // ctx.setLineDash([3])
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(this.x + this.width, this.y)
      ctx.lineTo(this.x + this.width, this.y + this.height)
      ctx.lineTo(this.x, this.y + this.height)
      ctx.lineTo(this.x, this.y)
    }

    getFillColor() {
      switch (this.state) {
        case 'normal':
          return linearColor
        case 'error':
          return errColor
        default:
          return linearColor
      }
    }
    setState(state) {
      this.state = state
    }

    setSelected(selected) {
      const style = this.style
      style.stroke = selected ? '#224f84' : '#181616'
      style.lineDash = selected ? [10] : false
      if (selected && this.selectedAnimate === null) {
        this.selectedAnimate = setInterval(() => {
          if (style.lineDashOffset === 20) {
            style.lineDashOffset = 1
          } else {
            style.lineDashOffset++
          }
          this.attr('style', style)
          console.log('update selected')
        }, 50)
      } else {
        clearInterval(this.selectedAnimate)
        this.selectedAnimate = null
      }
      this.attr('style', style)
    }
}

export default ViewBackgroundShape
