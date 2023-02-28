import { ZLevel } from '../shape/Const'

const Zrender = require('zrender')
import Config from '../Config'
const MenuConfig = Config.MenuConfig

class MenuItem extends Zrender.Group {
  index
  /**
   * 菜单持有者
   * @type {zrender.shape}
   */
  owner
  /**
   * 展示文字
   * @type {string}
   */
  text

  /**
   * 点击后回调
   * @type {function}
   */
  callback

  /**
   * 显示在文字前的图标
   * @type {string |DataURI|HTMLImageElement|HTMLCanvasElement|null}
   */
  icon

  /** @type {Zrender.Rect} */
  backgroundShape
  /** @type {Zrender.Image} */
  iconImage
  /** @type {Zrender.Text} */
  textShape

  /**
   * 构造函数
   * @param {number} index 序号
   * @param {zrender.shape} owner 菜单持有者
   * @param {string} text 显示文字
   * @param {function} callback 点击回调
   * @param {string |DataURI|HTMLImageElement|HTMLCanvasElement|null} icon 图标
   */
  constructor(index, owner, text, callback, icon) {
    super({
      zlevel: ZLevel.CONTEXT_MENU,
      draggable: false,
      onclick: (event) => {
        this.callback.call(owner, event)
      }
    })
    this.index = index
    this.text = text
    this.callback = callback
    this.icon = icon

    this.createShape()
  }

  /**
   * 构建菜单图形
   */
  createShape() {
    if (this.icon !== null) {
      this.iconImage = new Zrender.Image({
        zlevel: ZLevel.CONTEXT_MENU,
        silent: true,
        z1: 20,
        image: this.icon,
        x: 0,
        y: this.index * MenuConfig.HEIGHT,
        width: MenuConfig.HEIGHT,
        height: MenuConfig.HEIGHT
      })
      this.add(this.iconImage)
    }

    this.backgroundShape = new Zrender.Rect({
      zlevel: ZLevel.CONTEXT_MENU,
      z1: 10,
      shape: {
        x: 0,
        y: this.index * MenuConfig.HEIGHT,
        width: MenuConfig.WIDTH,
        height: MenuConfig.HEIGHT
      },
      style: {
        fill: MenuConfig.BG_COLOR,
        stroke: '#fa0000'
      }
    })
    this.add(this.backgroundShape)

    this.textShape = new Zrender.Text({
      zlevel: ZLevel.CONTEXT_MENU,
      z1: 20,
      x: MenuConfig.HEIGHT + 5,
      y: (this.index + 0.25) * MenuConfig.HEIGHT,

      style: {
        text: this.text,
        overflow: 'truncate',
        ellipsis: '.',
        fill: MenuConfig.FONT_COLOR,
        fontSize: MenuConfig.FONT_SIZE,
        width: MenuConfig.WIDTH - MenuConfig.HEIGHT
      }
    })
    this.add(this.textShape)
  }
}
export default MenuItem
