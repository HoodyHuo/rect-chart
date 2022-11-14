const zrender = require('zrender')
export default {
  // 节点字体配置
  BoxFont: {
    size: 3,
    color: '#173e38',
    colorSelected: '#51dddd',
    fontSize: 40
  },
  // 节点背景色配置
  backgroundColor: {
    // errColor 等节点 可添加，节点根据state字段进行颜色匹配
    default: new zrender.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: '#efe3ff'
      },
      {
        offset: 1,
        color: '#6cb3e9'
      }
    ]),
    errColor: new zrender.LinearGradient(0, 0, 0, 1, [
      {
        offset: 1,
        color: '#9a0851'
      },
      {
        offset: 0,
        color: '#244a7a'
      }
    ])
  },
  // 节点边框配置
  BoxBorder: {
    lineWidth: 3,
    color: '#1b391d', // 默认边框颜色
    colorSelected: '#12bc17', // 选中边框颜色
    speed: 30 // 滚动包围速度 越小越块，必须大于10
  },
  // 尺寸调整盒子
  EditBox: {
    circleSize: 5, // 拖拽点大小
    circleColor: '#FF6EBE' // 颜色
  },
  // 连线盒子
  ConnectBox: {
    circleSize: 5,
    circleColor: '#1e3dd8'
  },
  // 线材
  Line: {
    lineWidth: 5, // 线条粗细
    color: '#62d53a', // 颜色
    handle: {
      size: 5, // 移动线条 圆点大小
      color: '#17329a' // 颜色
    }
  }
}
