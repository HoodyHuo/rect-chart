const zrender = require('zrender')
export default {
  BoxFont: {
    size: 3,
    color: '#173e38',
    colorSelected: '#51dddd',
    fontSize: 40
  },
  backgroundColor: {
    linearColor: new zrender.LinearGradient(0, 0, 0, 1, [
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
  BoxBorder: {
    lineWidth: 3,
    color: '#1b391d',
    colorSelected: '#3fba4e',
    speed: 20
  },
  EditBox: {
    circleSize: 5,
    circleColor: '#FF6EBE'
  }
}