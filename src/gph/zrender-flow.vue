<template>
  <div
    ref="container"
    class="container"
    @dragenter="createNode"
    @dragover="nodeMove"
    @dragleave="createDone"
  />
</template>

<script>
import Workbench from './workbench'

const _extractData = (event) => {
  const items = event.dataTransfer.items
  for (let i = 0; i < items.length; i++) {
    const item = items[i].type
    if (item.indexOf('node') === 0) {
      return JSON.parse(item.slice(4, item.length))
    }
  }
  return null
}

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
    createNode(event) {
      // eslint-disable-next-line no-unused-vars
      const data = _extractData(event)
      if (data === null) {
        console.log('拖拽元素不符合要求')
        return
      }
      this.workbench.createNode({ x: event.offsetX, y: event.offsetY }, false)
    },
    nodeMove(event) {
      this.workbench.tempNodeMoving(event,
        { x: event.offsetX, y: event.offsetY })
    },
    createDone(event) {
      this.workbench.createNodeEnd(!event.relatedTarget)
    },

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
