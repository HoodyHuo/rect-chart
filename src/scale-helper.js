import { calcContentRect } from './util'

/**
 * 缩放辅助对象
 */
class ScaleHelper {
  /**
   * 缩放比例
   * @type {number}
   */
  scale = 1

  _elOri // 挂载的原始dom元素

  constructor(zr, elOri, scale) {
    this._elOri = elOri
    this.scale = scale
    this._zr = zr
    this._bindCtrl()
  }

  _bindCtrl() {
    // 全局缩放处理,按下ctrl + 鼠标滚轮
    this._zr.on('mousewheel', (event) => {
      if (!event.event.ctrlKey) {
        return
      }
      event.stop()
      const result = this.scaleZrender(this.scale + (event.wheelDelta / 10), event)
      if (result) {
        this.scale += event.wheelDelta / 10
      }
    })
  }
  /**
   * 对zrender整体进行缩放
   * @param {number} scale 缩放比例
   * @param {event | null} event 缩放比例
   */
  scaleZrender(scale, event) {
    console.debug('SCALE:' + scale)
    // 比例小于0.2 则阻止缩放
    if (scale < 0.2 || scale > 2) {
      return false
    }
    // 设置元素缩放比例
    this._zr.dom.style.webkitTransform = `scale(${scale},${scale})`
    this._zr.dom.style.webkitTransformOrigin = `left top`
    // this._zr.dom.style.zoom = scale
    // 计算保持物理尺寸并设置元素大小

    // zrenderInstance.dom.style.height = origin.height / scale + 'px'
    // zrenderInstance.dom.style.width = origin.width / scale + 'px'
    // zrender 重绘制
    // this._zr.resize()

    /** 缩放后，定位到指定位置
     if (event) {
      const x = event.offsetX - (this._zr.dom.clientWidth * scale * 0.1)
      const y = event.offsetY - (this._zr.dom.clientHeight * scale * 0.1)
      console.log(x + '-' + y)
      this._elOri.scrollTo(x, y)
    }*/

    // 更新缓存的 缩放
    this.scale = scale
  }
  reScaleByContent(nodes, lines) {
    // 寻找最右侧、最下侧元素位置
    const { maxX, maxY } = calcContentRect(nodes, lines)

    const scale = Math.min(
      1,
      this._elOri.offsetWidth / (maxX + 100),
      this._elOri.offsetHeight / (maxY + 100)
    )
    this.scaleZrender(scale, null)
  }
}
export default ScaleHelper
