import Menu from './Menu'
import { findParent } from '../util'

/**
 * 菜单事件处理对象
 * 读取节点内的菜单配置信息，并创建菜单
 * 配置结构,数组依次生成
 * @param {JSON[]} itemsProp 菜单构建参数
 *     @param {string} itemsProp.text 显示文字
 *     @param {function} itemsProp.callback 点击回调
 *     @param {string |DataURI|HTMLImageElement|HTMLCanvasElement|null} itemsProp.icon 图标
 */
class MenuHandler {
  _zr = null
  _menuShape = null

  constructor(zr) {
    this._zr = zr
    this.bindEvent()
  }

  /**
   *
   * @param {NodeBox|Line} target
   * @param {Zrevent} event
   */
  show(target, event) {
    const menuConfig = target.menus
    if (menuConfig) {
      this._menuShape = new Menu(this._zr, target, menuConfig)
      this._menuShape.show(event.offsetX, event.offsetY)
    }
  }

  clear() {
    if (this._menuShape !== null) {
      this._menuShape.clear()
      this._menuShape = null
    }
  }

  bindEvent() {
    // 右键菜单处理
    this._zr.on('contextmenu', (event) => {
      // 事件接管，不再传播
      event.stop()
      // 如果没有点到对象，则不管
      if (!event.target) {
        return
      }
      // 如果点到对象，找到顶层
      const target = findParent(event.target)
      this.show(target, event)
    })
    // 在鼠标任意点击后，清理当前菜单显示
    this._zr.on('mouseup', (event) => {
      this.clear()
    })
  }
}
export default MenuHandler
