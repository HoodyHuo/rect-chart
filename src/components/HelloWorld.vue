<template>
  <div>
    <el-button @click="save">保存</el-button>
    <el-button @click="clear">清除</el-button>
    <div class="hello">
      <zrender-flow
        ref="flow"
        class="content"
        :nodes="data.nodes"
        :lines="data.lines"
        @select="ccc"
      />
    </div>
  </div>
</template>

<script>
import ZrenderFlow from '@/gph/zrender-flow'
export default {
  name: 'HelloWorld',
  components: { ZrenderFlow },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    msg: String
  },
  data() {
    return {
      data: { 'lines': [{ 'from': { 'name': 'zrender2', 'scaleX': 0.5, 'scaleY': 0, 'direction': 'top' }, 'to': { 'name': 'zrender1', 'scaleX': 0.475, 'scaleY': 1, 'direction': 'bottom' }, 'path': [[142, 393], [142, 317], [126, 317], [126, 241]] }, { 'from': { 'name': 'zrender1', 'scaleX': 1, 'scaleY': 0.5, 'direction': 'right' }, 'to': { 'name': 'zrender3', 'scaleX': 0, 'scaleY': 0.53, 'direction': 'left' }, 'path': [[231, 141], [266, 141], [266, 47.1], [300, 47.1]] }, { 'from': { 'name': 'zrender3', 'scaleX': 1, 'scaleY': 0.5, 'direction': 'right' }, 'to': { 'name': 'zrender4', 'scaleX': 0.529999999999998, 'scaleY': 0, 'direction': 'top' }, 'path': [[441, 45], [493.95999999999935, 45], [493.95999999999935, 151]] }, { 'from': { 'name': 'zrender4', 'scaleX': 0.5, 'scaleY': 1, 'direction': 'bottom' }, 'to': { 'name': 'zrender5', 'scaleX': 1, 'scaleY': 0.45, 'direction': 'right' }, 'path': [[484, 284], [484, 304], [627, 304], [627, 429], [607, 429]] }, { 'from': { 'name': 'zrender5', 'scaleX': 0, 'scaleY': 0.5, 'direction': 'left' }, 'to': { 'name': 'zrender2', 'scaleX': 0.38500000000000145, 'scaleY': 1, 'direction': 'bottom' }, 'path': [[407, 434], [387, 434], [387, 479], [129.58000000000015, 479], [129.58000000000015, 459]] }], 'nodes': [{ 'x': 31, 'y': 41, 'width': 200, 'height': 200, 'name': 'zrender1', 'target': { 'name': 'zrender1', 'age': 50 }}, { 'x': 88, 'y': 393, 'width': 108, 'height': 66, 'name': 'zrender2', 'target': { 'name': 'zrender2', 'age': 20 }}, { 'x': 300, 'y': 10, 'width': 141, 'height': 70, 'name': 'zrender3', 'target': { 'name': 'zrender3', 'age': 20 }}, { 'x': 407, 'y': 384, 'width': 200, 'height': 100, 'name': 'zrender5', 'target': { 'name': 'zrender5', 'age': 20 }}, { 'x': 318, 'y': 151, 'width': 332, 'height': 133, 'name': 'zrender4', 'target': { 'name': 'zrender4', 'age': 20 }}] }
    }
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    ccc(event, target) {
      console.log(JSON.stringify(target) + '-click')
    },
    save() {
      const data = this.$refs.flow.save()
      console.log(JSON.stringify(data))
    },
    clear() {
      this.$refs.flow.clear()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.hello {
  width: 100%;
  height: 100%;
}
.content {
  height: 600px;
  width: 1000px;
}
</style>
