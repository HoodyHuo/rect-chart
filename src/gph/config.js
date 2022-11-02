const zrender = require('zrender')
export default {
  font: {
    size: 3,
    color: '#000000'
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
  }
}
