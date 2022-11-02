<template>
<div ref="container" class="container">
</div>
</template>


<script>
import NodeBox from '@/gph/NodeBox'
const Zrender = require('zrender')
export default {
  name: "zrender-flow",
  props:{
    nodes: {
      type: Array,
      required: true,
    }
  },
  data(){
    return {
      zr:null,
      boxList:[],
      selectedBox:null,
    }
  },
  mounted() {
    this.zr = Zrender.init(this.$refs.container)
    for (let i = 0; i < this.nodes.length; i++) {
      const opt = this.nodes[i]
      const opt2 = {selectChange:this.onZrClick}
      Object.assign(opt2,opt)
      const n1 = new NodeBox(opt2)
      this.zr.add(n1);
      this.boxList.push(n1)
    }

  },
  methods:{
    /**
     * 处理box点击，保留最后一个选择，并上报事件
     * @param event 原始Zrender事件
     * @param box   被选择的盒子
     */
    onZrClick(event,box) {
      if(this.selectedBox !== box){
        if(this.selectedBox !== null){
          this.selectedBox.selected(false)
        }
        this.selectedBox = box
        this.selectedBox.selected(true)
      }
      /**
       * 上报选择事件
       * @param event Zrender事件
       * @param target 盒子绑定的数据对象
       */
      this.$emit("select",event,box.target)
    }
  },

}
</script>

<style scoped>
.container{
  width: 100%;
  height: 100%;
  background-color: darkgray;
}
</style>
