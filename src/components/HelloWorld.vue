<template>
  <div>
    当前模式: {{ mode === 0 ?"查看模式":"编辑模式" }}
    <div
      class="item"
      draggable="true"
      @dragstart="pTrans"
      @keydown="deleteSelect"
    >拖拽我</div>
    <button @click="save">保存</button>
    <button @click="clear">清除</button>

    <button @click="edit">编辑模式</button>
    <button @click="view">查看模式</button>

    <div class="hello">
      <zrender-flow
        ref="flow"
        class="content"
        :nodes="data.nodes"
        :lines="data.lines"
        :mode="mode"
        @select-node="ccc"
        @select-line="ccc2"
      />
    </div>
  </div>
</template>

<script>
import ZrenderFlow from '../gph/zrender-flow'
import { WorkbenchMode } from '../gph/shape/Const'
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
        'lines': [
          { 'target': { 'id': 55 },
            'from': { 'zrenderId': 2348, 'target': { 'name': 'zrender5', 'age': 20 }, 'scaleX': 0.5, 'scaleY': 0, 'direction': 'top' },
            'to': { 'zrenderId': 2357, 'target': { 'name': 'zrender4', 'age': 20 }, 'scaleX': 0.4879518072289157, 'scaleY': 1, 'direction': 'bottom' },
            'path': [[191, 131], [191, 111], [71, 111], [71, 464], [179.6987951807229, 464], [179.6987951807229, 444]] }
        ],
        'nodes': [
          { id: 2348, 'x': 81, 'y': 128, 'width': 200, 'height': 200, 'name': 'zrender1', 'target': { 'name': 'zrender1', 'age': 50 },
            menus: [
              { icon: null, text: 'anniu1', callback: (e1, e2) => { console.log('2348-anniu1') } },
              { icon: null, text: 'anniu2', callback: (e1, e2) => { console.log('2348-anniu2') } }
            ] },
          { id: 2357, 'x': 116, 'y': 387, 'width': 108, 'height': 66, 'name': 'zrender2', 'target': { 'name': 'zrender2', 'age': 20 }},
          { 'x': 352, 'y': 41, 'width': 141, 'height': 70, 'name': 'zrender3', 'target': { 'name': 'zrender3', 'age': 20 }},
          { 'x': 366, 'y': 416, 'width': 200, 'height': 100, 'name': 'zrender5', 'target': { 'name': 'zrender5', 'age': 20 }},
          { 'x': 344, 'y': 188, 'width': 332, 'height': 133, 'name': 'zrender4', 'target': { 'name': 'zrender4', 'age': 20 }}]
      },
      count: 1,
      mode: WorkbenchMode.VIEW
    }
  },
  methods: {
    pTrans(event) {
      event.dataTransfer.setData('node' + JSON.stringify({
        width: 50, height: 50, name: 'aaa' + this.count
      }), 1)
    },
    // eslint-disable-next-line no-unused-vars
    ccc(event, box, target) {
      console.log(JSON.stringify(target) + '-click')
    },
    ccc2(event, line, target) {
      console.log(JSON.stringify(target) + '-click')
    },
    save() {
      const data = this.$refs.flow.save()
      console.log(JSON.stringify(data))
    },
    clear() {
      this.$refs.flow.clear()
    },
    edit() {
      // this.$refs.flow.changeMode(WorkbenchMode.EDIT)
      this.mode = WorkbenchMode.EDIT
    },
    view() {
      // this.$refs.flow.changeMode(WorkbenchMode.VIEW)
      this.mode = WorkbenchMode.VIEW
    },
    deleteSelect() {
      this.$refs.flow.deleteSelect()
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
