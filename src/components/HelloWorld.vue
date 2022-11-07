<template>
  <div class="hello">
    <zrender-flow
      class="content"
      :nodes="nodeList"
      :lines="lineList"
      @select="ccc"
    />
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
      nodeList: [
        {
          x: 0,
          y: 0,
          width: 200,
          height: 200,
          name: 'zrender1',
          state: 'errColor',
          target: {
            name: 'zrender1',
            age: 50
          }
        }, {
          x: 200,
          y: 200,
          width: 200,
          height: 100,
          name: 'zrender2',

          target: {
            name: 'zrender2',
            age: 20
          }
        }, {
          x: 300,
          y: 10,
          width: 200,
          height: 100,
          name: 'zrender3',
          target: {
            name: 'zrender3',
            age: 20
          }
        }, {
          x: 450,
          y: 150,
          width: 200,
          height: 100,
          name: 'zrender4',
          target: {
            name: 'zrender4',
            age: 20
          }
        }
      ],
      lineList: [
        {
          from: 'zrender1',
          to: 'zrender2',
          path: [
            { x: 100, y: 100 },
            { x: 220, y: 120 },
            { x: 450, y: 100 }
          ]
        }
        // {
        //   from: 'zrender2',
        //   to: 'zrender3',
        //   path: []
        // },
        // {
        //   from: 'zrender3',
        //   to: 'zrender4',
        //   path: []
        // }
      ]
    }
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    ccc(event, target) {
      console.log(JSON.stringify(target) + '-click')
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
