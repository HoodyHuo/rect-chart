const zrender = require('zrender')
export default {
  wallColor: '#FFFFFF',
  // 节点字体配置
  BoxFont: {
    size: 3,
    color: '#ffffff',
    colorSelected: '#51dddd',
    fontSize: 40
  },
  // 节点背景色配置
  backgroundColor: {
    // errColor 等节点 可添加，节点根据state字段进行颜色匹配
    default: new zrender.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0.5,
        color: '#062856'
      },
      {
        offset: 1,
        color: '#043d82'
      }
    ]),
    errColor: new zrender.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: '#1b1940'
      },
      {
        offset: 0.7,
        color: '#940b1d'
      }
    ])
  },
  // 节点边框配置
  BoxBorder: {
    lineWidth: 1,
    color: '#3289ed', // 默认边框颜色
    colorSelected: '#ffffff', // 选中边框颜色
    speed: 50 // 滚动包围速度 越小越块，必须大于10
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
    color: new zrender.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: '#940b1d'
      },
      {
        offset: 0.7,
        color: '#1b1940'
      }
    ]), // 颜色
    handle: {
      size: 5, // 移动线条 圆点大小
      color: '#17329a' // 颜色
    }
  }
}
