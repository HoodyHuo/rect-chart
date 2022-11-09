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
 * 节点框
 */
class NodeBox extends zrender.Group {
    view // 背景shape
    fontView // 文字shape
    target // 附带信息
    name // 展示文字
    connectShape

    isSelected = false
    /**
     * @param {number} options.x X
     * @param {number} options.y Y
     * @param {number} options.z z 层叠顺序
     * @param {number} options.width 宽
     * @param {number} options.height 高
     * @param {string} options.name 显示名称
     * @param {json} options.target 节点关联对象
     * @param {json} options.state 节点状态
     * @param {boolean} options.draggable 是否可以拖动
     * @param {function} options.selectChange 选中回调函数
     * @param {function} options.move 被拖拽事件
     * @param {function} options.onDragEnter 有东西托进入
     * @param {function} options.onDragLeave 有东西脱出
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
        z: options.z,
        z2: 10,
        width: options.width,
        height: options.height,
        name: 'node',
        state: options.state,
        style: {
        },
        ondragenter: options.onDragEnter,
        ondragleave: options.onDragLeave,
        // group options
        draggable: true
      })
      this.fontView = new zrender.Text({
        z: options.z,
        z2: 20,
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
        z: options.z,
        z2: 30,
        width: options.width,
        height: options.height,
        draggable: false,
        box: this,
        onCreateLine: options.onCreateLine,
        onMoveLine: options.onMoveLine,
        onEndLine: options.onEndLine
      })
      this.add(this.connectShape)

      // 绑定事件
      this.onclick = (event) => {
        options.selectChange.call(this, event, this)
      }
      this.ondrag = (event) => {
        options.move.call(this, event, this)
      }
    }

    selected(isSelected) {
      // eslint-disable-next-line no-debugger
      this.isSelected = isSelected
      this.view.setSelected(isSelected)

      this.fontView.attr({
        style: {
          fill: (isSelected ? BoxFont.colorSelected : BoxFont.color)
        }})
    }
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
