<template>
  <div
    ref="container"
    class="container"
  />
</template>

<script>
import NodeBox from './NodeBox'
const Zrender = require('zrender')
export default {
  name: 'ZrenderFlow',
  props: {
    nodes: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      zr: null,
      boxList: [],
      selectedBox: null
    }
  },
  mounted() {
    this.zr = Zrender.init(this.$refs.container)
    this.zr.on('click', (e) => {
      console.dir(e.offsetX + '-' + e.offsetY)
    })

    for (let i = 0; i < this.nodes.length; i++) {
      const opt = this.nodes[i]
      const opt2 = { selectChange: this.onZrClick }
      Object.assign(opt2, opt)
      opt2.z = i + 1
      const nodeBox = new NodeBox(opt2)
      this.zr.add(nodeBox)
      this.boxList.push(nodeBox)
    }
  },
  methods: {
    /**
     * 处理box点击，保留最后一个选择，并上报事件
     * @param event 原始Zrender事件
     * @param box   被选择的盒子
     */
    onZrClick(event, box) {
      if (this.selectedBox !== box) {
        if (this.selectedBox !== null) {
          this.selectedBox.selected(false)
        }
        if (box) {
          this.selectedBox = box
          this.selectedBox.selected(true)
        }
      }
      /**
       * 上报选择事件
       * @param event Zrender事件
       * @param target 盒子绑定的数据对象
       */
      this.$emit('select', event, box ? box.target : null)
    }
  }

}
</script>

<style scoped>
.container{
  width: 100%;
  height: 100%;
  background-color: darkgray;
}
</style>
