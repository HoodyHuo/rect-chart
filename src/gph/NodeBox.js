import ViewBackgroundShape from "@/gph/shape/ViewBackgroundShape";

const zrender = require('zrender')

const defaultOptions = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    name : 'node',
    style :{

    },
    //group options
    draggable: true,
}

/**
 * 节点框
 */
class NodeBox extends zrender.Group{
    view   //背景shape
    fontView // 文字shape
    target // 附带信息
    name  // 展示文字

    isSelected = false
    /**
     * @param {number} options.x X
     * @param {number} options.y Y
     * @param {number} options.width 宽
     * @param {number} options.height 高
     * @param {string} options.name 显示名称
     * @param {json} options.target 节点关联对象
     * @param {boolean} options.draggable 是否可以拖动
     * @param {function} options.selectChange 选中回调函数
     * @constructor
     */
    constructor(options) {
        // 处理构造参数
        const option = {}
        Object.assign(option, defaultOptions, options)
        // 初始化
        super(option);
        // 属性赋值
        this.target = options.target
        this.name = options.name
        //创建展示shape
        this.view = new ViewBackgroundShape(option)
        this.fontView = new zrender.Text({
            style: {
                text: options.name,
                x: options.x *2,
                y: options.y *2,
                overflow: 'truncate' ,
                // lineOverflow : 'truncate',
                ellipsis : '.',
                fill:'ac1818',
                stroke: '#000000',
                fontSize: 50,
                width:options.width,
            },

        })
        // shape 加入当前组合
        this.add(this.view)
        this.add(this.fontView)

        //绑定事件
        this.onclick = (event) => {
            options.selectChange.call(this, event,this)
        }
    }


    selected(isSelected) {
        // eslint-disable-next-line no-debugger
        this.isSelected = isSelected
        const style = this.view.style
        style.stroke = isSelected? '#16c003': '#181616'
        this.view.attr("style", style)
    }
}

export  default  NodeBox
