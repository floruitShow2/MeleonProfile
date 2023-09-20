<template>
  <div class="display_frame_module">
    <div class="display-frame-header">
      <h4>{{ title }}</h4>
    </div>
    <div ref="container" class="display-frame-container">
      <template v-if="type === 'label'">
        <div v-for="(v, k) in mockData" :key="k" class="row">
          <span>{{ k }}</span>
          <el-input v-model="mockData[k]" size="mini"></el-input>
        </div>
      </template>
      <div v-else class="chart-container">
        <TestBarChart class="chart" :size="size" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { Component, Prop, Ref } from 'vue-property-decorator'
  import { Dictionary } from 'vue-router/types/router'
  import TestBarChart from './ws-test-chart.vue'

  @Component({
    components: {
      TestBarChart
    }
  })
  class WsDisplayFrame extends Vue {
    @Ref() container!: HTMLElement

    @Prop({ default: '' }) title!: string

    type: 'label' | 'chart' = 'chart'

    mockData: Dictionary<string> = {
      item_1: '1',
      item_2: '2',
      item_3: '3',
      item_4: '4',
      item_5: '5',
      item_6: '6'
    }

    size = {
      width: 200,
      height: 150
    }

    mounted() {
      // const { width, height } = this.container.getBoundingClientRect()
      // this.size = { width, height }
      // this.$broadOn('onControlsChange', () => {
      //   const { width, height } = this.container.getBoundingClientRect()
      //   this.size = { width, height }
      // })
    }
  }
  export default WsDisplayFrame
</script>

<style lang="less" scoped>
  @import '~@/styles/theme.less';
  @import '~@/styles/layout.less';
  .display_frame_module {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 460px;
    padding: 40px 20px;
    transform-style: preserve-3d;
    .display-frame-header {
      box-sizing: border-box;
      padding: 0 10px;
      width: 100%;
      height: 50px;
      background: linear-gradient(#4fabe0, #0e437c);
      transform-style: preserve-3d;
      transform: translateZ(10);
      clip-path: polygon(
        0px 15px,
        15px 0px,
        calc(60% - 15px) 0px,
        60% 15px,
        calc(100% - 15px) 15px,
        100% 30px,
        100% 100%,
        0 100%,
        0% 15px
      );
      #flex(row, center, flex-start);
      h4 {
        margin-block: 0;
        font-weight: 900;
        color: #e0f7ff;
      }
    }
    .display-frame-container {
      width: calc(100% - 1px);
      height: 150px;
      overflow: auto;
      border: solid 1px #09b1ec;
      border-top: 0;
      box-shadow: 0 0 10px #b0d6f5;
      background-color: #000000;
      // #color(background-color, --lighter-blue-color);
      backdrop-filter: blur(20px) brightness(80%);
      #flex(column, center, flex-start);
      .row {
        width: 100%;
        margin-bottom: 10px;
        #flex(row, center, space-between);
        span {
          margin-right: 10px;
          color: #ffffff;
        }
      }
      .row:last-child {
        margin-bottom: 0;
      }
      .chart-container {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
