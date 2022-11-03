const Zrender = require('zrender')
import NodeBox from './NodeBox'
import EditShape from './shape/EditShape'

class Workbench {
  el // the DOM element
  zr // zrender instance
  nodes // array of node json

  selectedBox = null // the selected node
  boxList = [] // array of DrawNode
  resizeBox = null

  clickNodeCallback // callback

  /**
     * @constructor
     * @param options.el
   *   @param options.nodes
   *   @param options.clickNode
     */
  constructor(options) {
    this.el = options.el
    this.nodes = options.nodes
    this.zr = Zrender.init(options.el)
    this.clickNodeCallback = options.clickNode

    this._bindingEvent()
    this._initResizeBox()
    this._createNodes()
  }

  _bindingEvent() {
    this.zr.on('click', (e) => {
      console.dir(e.offsetX + '-' + e.offsetY)
    })
  }

  _createNodes() {
    for (let i = 0; i < this.nodes.length; i++) {
      const nodeData = this.nodes[i]
      const opt2 = {
        selectChange: this._onNodeClick.bind(this),
        move: this._onNodeMove.bind(this)
      }
      Object.assign(opt2, nodeData)
      opt2.z = i + 1
      const nodeBox = new NodeBox(opt2)
      this.zr.add(nodeBox)
      this.boxList.push(nodeBox)
    }
  }

  _onNodeClick(event, box) {
    if (this.selectedBox !== box) {
      if (this.selectedBox !== null) {
        this.selectedBox.selected(false)
      }
      if (box) {
        this.selectedBox = box
        this.selectedBox.selected(true)
        this.resizeBox.show(box)
      }
    }
    /**
     * 上报选择事件
     * @param event Zrender事件
     * @param target 盒子绑定的数据对象
     */
    this.clickNodeCallback(event, box ? box.target : null)
  }

  _initResizeBox() {
    const resizeBox = new EditShape({
      onSizeChange: this._onSizeChange.bind(this)
    })
    this.zr.add(resizeBox)
    this.resizeBox = resizeBox
  }

  _onSizeChange(box, param) {

  }
  _onNodeMove(event, box) {
    if (this.selectedBox === box) {
      this.resizeBox._moveToBox(box)
    }
  }
}

export default Workbench
