<template>
  <div
    ref="container"
    class="container"
  />
</template>

<script>
import Workbench from './workbench'
export default {
  name: 'ZrenderFlow',
  props: {
    nodes: {
      type: Array,
      required: true
    },
    lines: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      workbench: null
    }
  },
  mounted() {
    this.workbench = new Workbench({
      el: this.$refs.container,
      nodes: this.nodes,
      lines: this.lines,
      clickNode: this.onZrClick
    })
  },
  methods: {
    /**
     * 处理box点击，保留最后一个选择，并上报事件
     * @param event 原始Zrender事件
     * @param node
     */
    onZrClick(event, node) {
      this.$emit('select', event, node)
    },
    /**
     * 保存当前布置结构
     * @return {{nodes: [], lines: []}}
     */
    save() {
      return this.workbench.save()
    },
    clear() {
      this.workbench.clear()
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
