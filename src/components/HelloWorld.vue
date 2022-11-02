<template>
  <div class="hello">
    <zrender-flow
      class="content"
      :nodes="nodeList"
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
    msg: String
  },
  data() {
    return {
      nodeList: [
        {
          x: 150,
          y: 100,
          width: 200,
          height: 100,
          name: 'zrender1',
          target: {
            name: 'zrender1',
            age: 50
          }
        }, {
          x: 80,
          y: 50,
          width: 200,
          height: 100,
          name: 'zrender2',
          target: {
            name: 'zrender2',
            age: 20
          }
        }, {
          x: 90,
          y: 150,
          width: 200,
          height: 100,
          name: 'zrender3',
          target: {
            name: 'zrender3',
            age: 20
          }
        }, {
          x: 30,
          y: 100,
          width: 200,
          height: 100,
          name: 'zrender4',
          target: {
            name: 'zrender4',
            age: 20
          }
        }
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
  width: 800px;
}
</style>
