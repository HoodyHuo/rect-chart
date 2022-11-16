const zrender = require('zrender')
export default {
  // zrender画布背景色
  wallpaperColor: '#FFFFFF',
  // 节点字体配置
  BoxFont: {
    color: '#ffffff', // 节点文字颜色
    colorSelected: '#51dddd', // 被选中字体颜色
    fontSize: 40 // 节点字体大小
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
    lineWidth: 1, // 节点边框粗细
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
    circleSize: 5, // 连接点大小
    circleColor: '#1e3dd8' // 连接点填充颜色
  },
  // 线段
  Line: {
    lineWidth: 5, // 线条粗细
    // 线条颜色
    color: new zrender.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: '#940b1d'
      },
      {
        offset: 0.7,
        color: '#1b1940'
      }
    ]),
    // 线段中间调整按钮
    handle: {
      size: 5, // 移动线条 圆点大小
      color: '#17329a' // 颜色
    }
  }
}
