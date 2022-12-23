const zrender = require('zrender')
export default {
  // zrender画布背景色
  wallpaperColor: '#061b46',
  // 节点字体配置
  BoxFont: {
    color: '#ffffff', // 节点文字颜色
    colorSelected: '#ffffff', // 被选中字体颜色
    fontSize: 20 // 节点字体大小
  },
  // 节点背景色配置
  NodeColor: {
    // errColor 等节点 可添加，节点根据state字段进行颜色匹配
    default: {
      background: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0.5,
          color: '#062856'
        },
        {
          offset: 1,
          color: '#043d82'
        }
      ]),
      border: '#3289ed'
    },
    P0: {
      background: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0.5,
          color: '#062856'
        },
        {
          offset: 1,
          color: '#043d82'
        }
      ]),
      border: '#3289ed'
    },
    P1: {
      background: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0.5,
          color: '#062856'
        },
        {
          offset: 1,
          color: '#043d82'
        }
      ]),
      border: '#3289ed'
    },

    P2: {
      background: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#1b1940'
        },
        {
          offset: 0.7,
          color: '#ffbe51'
        }
      ]),
      border: '#ffed58'
    },
    P3: {
      background: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#1b1940'
        },
        {
          offset: 0.7,
          color: '#93115b'
        }
      ]),
      border: '#940b5d'
    },
    P4: {
      background: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#1b1940'
        },
        {
          offset: 0.7,
          color: '#940b1d'
        }
      ]),
      border: '#940b1d'
    },
    offline: {
      background: '#3f4c67',
      border: '#a0a0a0'
    }
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
    circleFill: '#e5e5e5', // 连接点填充颜色
    circleStroke: '#aaaaaa' //
  },
  // 连线盒子
  ConnectBox: {
    circleSize: 5, // 连接点大小
    circleFill: '#e5e5e5', // 连接点填充颜色
    circleStroke: '#54c7fd' //
  },
  // 线段
  Line: {
    lineWidth: 3, // 线条粗细
    lineSpeed: 600,
    // 线条颜色
    color: {
      default: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#234996'
        },
        {
          offset: 0.7,
          color: '#00b3fd'
        }
      ]),
      health: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#234996'
        },
        {
          offset: 0.7,
          color: '#00b3fd'
        }
      ]),
      error: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#234996'
        },
        {
          offset: 0.7,
          color: '#fd5f60'
        }
      ]),
      warning: new zrender.LinearGradient(0, 0, 0, 1, [
        {
          offset: 0,
          color: '#234996'
        },
        {
          offset: 0.7,
          color: '#f8b551'
        }
      ]),
      offline: '#3f4c67'
    },
    // 线段中间调整按钮
    handle: {
      size: 5, // 移动线条 圆点大小
      color: '#17329a' // 颜色
    },
    ArrowSize: 10 // 箭头大小
  },
  MenuConfig: {
    WIDTH: 150,
    HEIGHT: 30,
    BG_COLOR: '#FFFFFF',
    FONT_SIZE: 18,
    FONT_COLOR: '#000000'
  }
}
