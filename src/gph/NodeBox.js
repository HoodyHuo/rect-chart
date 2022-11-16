import ViewBackgroundShape from './shape/ViewBackgroundShape'
import config from './BoxConfig'
import ConnectShape from '@/gph/shape/ConnectShape'
const zrender = require('zrender')
const BoxFont = config.BoxFont

const defaultOptions = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  name: 'node',
  style: {

  },
  // group options
  draggable: true
}

/**
 * 节点类
 */
class NodeBox extends zrender.Group {
    view // 背景shape
    fontView // 文字shape
    target // 附带信息
    name // 展示文字
    connectShape

    isSelected = false
    /**
     * 构造函数
     * @param {number} options.x X
     * @param {number} options.y Y
     * @param {number} options.z z 层叠顺序
     * @param {number} options.width 宽
     * @param {number} options.height 高
     * @param {string} options.name 显示名称
     * @param {json} options.target 节点关联数据（附加数据）
     * @param {json} options.state 节点状态
     * @param {boolean} options.draggable 是否可以拖动
     * @param {function} options.selectChange 选中回调函数
     * @param {function} options.move workbench 监听节点移动回调
     *
     * @param {function} options.onCreateLine
     * @param {function} options.onMoveLine
     * @param {function} options.onEndLine
     * @constructor
     */
    constructor(options) {
      // 处理构造参数
      const option = {
      }
      Object.assign(option, defaultOptions, options)
      // 初始化
      super(option)
      // 属性赋值
      this.target = options.target
      this.name = options.name
      // 创建展示shape
      this.view = new ViewBackgroundShape({
        box: this,
        z1: options.z,
        width: options.width,
        height: options.height,
        name: 'node',
        state: options.state,
        style: {
        },
        // group options
        draggable: true
      })
      this.fontView = new zrender.Text({
        box: this,
        z1: options.z,
        silent: true,
        style: {
          text: options.name,
          overflow: 'truncate',
          ellipsis: '.',
          fill: BoxFont.color,
          fontSize: BoxFont.fontSize,
          width: options.width
        }
      })
      // shape 加入当前组合
      this.add(this.view)
      this.add(this.fontView)

      // 创建链接盒子
      this.connectShape = new ConnectShape({
        x: 0,
        y: 0,
        z1: options.z,
        width: options.width,
        height: options.height,
        draggable: false,
        box: this,
        onCreateLine: options.onCreateLine,
        onMoveLine: options.onMoveLine,
        onEndLine: options.onEndLine
      })
      this.connectShape.hide()
      this.add(this.connectShape)

      // 绑定事件
      this.onclick = (event) => {
        options.selectChange.call(this, event, this)
      }
      this.ondrag = (event) => {
        options.move.call(this, event, this)
      }
    }

    /**
   * 设置节点实例选中状态
   * 修改选中样式，
   * @param isSelected
   */
    selected(isSelected) {
      this.isSelected = isSelected
      this.view.setSelected(isSelected)

      this.fontView.attr({
        style: {
          fill: (isSelected ? BoxFont.colorSelected : BoxFont.color)
        }
      })
      isSelected ? this.connectShape.show() : this.connectShape.hide()
    }

    /**
   * 修改节点位置、尺寸
   * @param x
   * @param y
   * @param width
   * @param height
   */
    resize(x, y, width, height) {
      this.attr('x', x)
      this.attr('y', y)
      this.width = width
      this.height = height
      this.view.resize(0, 0, width, height)
      this.fontView.style.width = width
      this.fontView.attr('style', this.fontView.style)

      this.connectShape.resize(width, height)
    }
}

export default NodeBox
