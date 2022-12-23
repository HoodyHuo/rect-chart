
import MenuItem from './MenuItem'
import { ZLevel } from '../shape/Const'
const Zrender = require('zrender')
/**
 * 菜单对象
 * @author hoody
 */
class Menu {
  /**
   * 菜单持有者
   * @type {NodeBox|Line}
   */
  owner

  /**
   *
   * @type {MenuItem[]}
   */
  menuItems = []

  /**
   * 图形展示部分
   * @type {Zrender.Group}
   */
  shape

  /**
   * 构造函数
   * @param {Zrender} zr zrender实例
   * @param {NodeBox|Line} owner 菜单持有者
   * @param {JSON[]} itemsProp 菜单构建参数
   *     @param {string} itemsProp.text 显示文字
   *     @param {function} itemsProp.callback 点击回调
   *     @param {string |DataURI|HTMLImageElement|HTMLCanvasElement|null} itemsProp.icon 图标
   */
  constructor(zr, owner, itemsProp) {
    this.zr = zr
    this.owner = owner
    this.shape = new Zrender.Group({
      zlevel: ZLevel.CONTEXT_MENU
    })

    // 创建items
    for (let i = 0; i < itemsProp.length; i++) {
      const menuItem = new MenuItem(
        i,
        owner,
        itemsProp[i].text, itemsProp[i].callback, itemsProp[i].icon
      )
      this.menuItems.push(menuItem)
      this.shape.add(menuItem)
    }
    this.shape.hide()
    this.zr.add(this.shape)
  }

  /**
   * 显示菜单
   * @param x 显示菜单的位置
   * @param y 显示菜单的位置
   */
  show(x, y) {
    this.shape.x = x
    this.shape.y = y
    this.shape.show()
  }

  /**
   * 隐藏菜单
   */
  hide() {
    this.shape.hide()
  }

  clear() {
    this.zr.remove(this.shape)
  }
}

export default Menu
