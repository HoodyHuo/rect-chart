import { calcContentRect } from './util'
import { Group, ZRenderType, Element } from 'zrender'
import Line from './shape/Line'
import NodeBox from './shape/NodeBox'
import Workbench from './workbench'
/**
 * 缩放辅助对象
 */
class ScaleHelper {
  /**
   * 缩放比例
   * @type {number}
   */
  scale: number = 1
  private _zr: ZRenderType
  private _elOri: HTMLElement // 挂载的原始dom元素
  private _workbench: Workbench
  group: Group

  constructor(zr: ZRenderType, workbench: Workbench, elOri: HTMLElement, scale: number) {
    this._elOri = elOri
    this.scale = scale
    this._zr = zr
    this._workbench = workbench
    this.group = new Group({ name: 'scale' })
    this._zr.add(this.group)
    this._bindCtrl()
  }

  _bindCtrl() {
    // 全局缩放处理,按下ctrl + 鼠标滚轮
    this._zr.on('mousewheel', (event: any) => {
      if (!event.event.ctrlKey) {
        return
      }
      event.stop()
      const result = this.scaleZrender(this.scale + event.wheelDelta / 10, event)
      if (result) {
        this.scale += -event.wheelDelta / 10
      }
    })

    const movePanel = (event: MouseEvent) => {
      this.group.setPosition([this.group.x + event.movementX, this.group.y + event.movementY])
      this.group.dirty()
    }

    this._elOri.addEventListener('mousedown', (event: any) => {
      if (event.topTarget) {
        return
      }
      if (!event?.ctrlKey) {
        return
      }
      // this.loadNodesLines()
      this._elOri.addEventListener('mousemove', movePanel)
    })

    this._elOri.addEventListener('mouseup', (event: any) => {
      this._elOri.removeEventListener('mousemove', movePanel)
    })
  }
  /**
   * 对zrender整体进行缩放
   * @param {number} scale 缩放比例
   * @param {event | null} event 缩放比例
   */
  scaleZrender(scale: number, event: null | any) {
    console.debug('SCALE:' + scale)
    // 比例小于0.2 则阻止缩放
    if (scale < 0.2 || scale > 2) {
      return false
    }
    // this.loadNodesLines()
    const org = [event?.event?.clientX ?? 0, event?.event?.clientY ?? 0]
    this.group.setOrigin(org)
    this.group.setScale([scale, scale])
    this.group.dirty()
    // 更新缓存的 缩放
    this.scale = scale
  }

  reScaleByContent(nodes: NodeBox[], lines: Line[]) {
    // 寻找最右侧、最下侧元素位置
    const { maxX, maxY } = calcContentRect(nodes, lines)

    const scale = Math.min(1, this._elOri.offsetWidth / (maxX + 100), this._elOri.offsetHeight / (maxY + 100))
    this.scaleZrender(scale, null)
  }
  /**
   * 转换全局坐标到经过group处理后的坐标
   * @param x 全局X
   * @param y 全局Y
   * @returns 局部Xy
   */
  transformCoordToLocal(x: number, y: number): number[] {
    return this.group.transformCoordToLocal(x, y)
  }

  add(shape: Element) {
    this.group.add(shape)
  }

  remove(shape: Element) {
    this.group.remove(shape)
  }
}
export default ScaleHelper
