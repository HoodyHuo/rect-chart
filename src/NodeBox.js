import ViewBackgroundShape from './shape/ViewBackgroundShape'
import config from './Config'
import ConnectShape from './shape/ConnectShape'
import { WorkbenchMode } from './shape/Const'
const zrender = require('zrender')
const BoxFont = config.BoxFont

const defaultOptions = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  name: 'node',
  style: {},
  // group options
  draggable: true,
}

/**
 * 节点类
 */
class NodeBox extends zrender.Group {
  view // 背景shape
  fontView // 文字shape
  target // 附带信息
  name // 展示文字
  connectShape // 连线层

  isSelected = false // 当前是否是被选中状态

  mode // 当前工作模式
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
   *
   * @param {number} options.mode 当前模式
   *
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
    const option = {}
    Object.assign(option, defaultOptions, options)
    // 初始化
    super(option)
    // 属性赋值
    this.target = options.target
    this.name = options.name
    this.mode = options.mode
    // 创建展示shape
    this.view = new ViewBackgroundShape({
      box: this,
      z1: options.z,
      width: options.width,
      height: options.height,
      name: 'node',
      state: options.state,
      style: {},
      // group options
      draggable: false,
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
        width: options.width,
      },
    })
    this._resizeFontView()
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
      onEndLine: options.onEndLine,
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
    this.changeMode(this.mode)
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
        fill: isSelected ? BoxFont.colorSelected : BoxFont.color,
      },
    })
    // 仅仅编辑模式才展示且选中才展示连接框
    isSelected && this.mode === WorkbenchMode.EDIT ? this.connectShape.show() : this.connectShape.hide()
  }

  /**
   *
   * @param {number} mode
   */
  changeMode(mode) {
    this.mode = mode
    if (mode === WorkbenchMode.VIEW) {
      this.connectShape.hide()
      this.draggable = false
    } else if (mode === WorkbenchMode.EDIT) {
      if (this.isSelected) {
        this.connectShape.show()
      }
      this.draggable = true
    }
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
    this._resizeFontView()

    this.connectShape.resize(width, height)
  }

  _resizeFontView() {
    const rect = this.fontView.getBoundingRect()
    const fontx = (this.width - rect.width) / 2
    const fonty = (this.height - rect.height) / 2
    this.fontView.x = fontx
    this.fontView.y = fonty
    this.fontView.style.width = this.width
    this.fontView.dirty()
  }
}

export default NodeBox
