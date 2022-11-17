<template>
  <div>
    <div
      class="item"
      draggable="true"
      @dragstart="pTrans"
    >拖拽我</div>
    <button @click="save">保存</button>
    <button @click="clear">清除</button>
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
      data: {
        'lines': [{ 'from': { 'name': 'zrender2', 'scaleX': 0.4537037037037037, 'scaleY': 0, 'direction': 'top' }, 'to': { 'name': 'zrender1', 'scaleX': 0.475, 'scaleY': 1, 'direction': 'bottom' }, 'path': [[41, 322], [41, 108], [301, 108], [301, 348], [176, 348], [176, 328]] }, { 'from': { 'name': 'zrender1', 'scaleX': 1, 'scaleY': 0.5, 'direction': 'right' }, 'to': { 'name': 'zrender3', 'scaleX': 0, 'scaleY': 0.5299999999999999, 'direction': 'left' }, 'path': [[281, 228], [317, 228], [317, 78.1], [352, 78.1]] }, { 'from': { 'name': 'zrender3', 'scaleX': 1, 'scaleY': 0.5, 'direction': 'right' }, 'to': { 'name': 'zrender4', 'scaleX': 0.529999999999998, 'scaleY': 0, 'direction': 'top' }, 'path': [[493, 76], [513, 76], [513, 173], [503.95999999999935, 173], [503.95999999999935, 193]] }, { 'from': { 'name': 'zrender4', 'scaleX': 0.5, 'scaleY': 1, 'direction': 'bottom' }, 'to': { 'name': 'zrender5', 'scaleX': 1, 'scaleY': 0.45, 'direction': 'right' }, 'path': [[494, 326], [494, 346], [627, 346], [627, 429], [607, 429]] }, { 'from': { 'name': 'zrender5', 'scaleX': 0, 'scaleY': 0.5, 'direction': 'left' }, 'to': { 'name': 'zrender2', 'scaleX': 0.38500000000000145, 'scaleY': 1, 'direction': 'bottom' }, 'path': [[407, 434], [33.580000000000155, 434], [33.580000000000155, 388]] }],
        'nodes': [
          { 'x': 81, 'y': 128,
            'width': 200, 'height': 200,
            'name': 'zrender1',
            state: 'error',
            'target': { 'name': 'zrender1', 'age': 50 }},
          { 'x': -8, 'y': 322, 'width': 108, 'height': 66, 'name': 'zrender2',
            state: 'offline',
            'target': { 'name': 'zrender2', 'age': 20 }},
          { 'x': 352, 'y': 41, 'width': 141, 'height': 70, 'name': 'zrender3',
            state: 'warning',
            'target': { 'name': 'zrender3', 'age': 20 }},
          { 'x': 407, 'y': 384, 'width': 200, 'height': 100, 'name': 'zrender5',
            'target': { 'name': 'zrender5', 'age': 20 }},
          { 'x': 328, 'y': 193, 'width': 332, 'height': 133, 'name': 'zrender4',
            'target': { 'name': 'zrender4', 'age': 20 }}
        ]
      },
      count: 1
    }
  },
  methods: {
    pTrans(event) {
      event.dataTransfer.setData('node' + JSON.stringify({
        width: 50, height: 50, name: 'aaa' + this.count
      }), 1)
    },
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
.item{
  width: 50px;
  background-color: cadetblue;
}
</style>
