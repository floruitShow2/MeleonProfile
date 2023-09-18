<template>
  <div class="ws_layers_list_module">
    <div class="select-container">
      <i class="iconfont icon-filter icon-button__base" />
      <el-input v-model="filterOptions.SelectQuery" size="mini">
        <i slot="prefix" class="iconfont icon-search"></i>
      </el-input>
      <i class="iconfont icon-arrow-top icon-button__base" @click="handleTotalFolders" />
    </div>
    <div class="list-container">
      <ws-layers-group ref="layersGroup" :total-layers="layers" :layers="filterLayers" :level="0" />
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { Component, Emit, Prop, Ref, Watch } from 'vue-property-decorator'
  import { Dictionary } from '@/interface/Basic'
  import { LayersType } from '../Methods/Layers'
  import WsLayersGroup from './ws-layers-group.vue'
  import { deepClone } from '@/utils/specificFunc'

  @Component({
    components: {
      WsLayersGroup
    }
  })
  class WsLayersList extends Vue {
    @Prop({ required: true }) layers!: LayersType

    // 是否开启手风琴模式
    @Prop({ default: false }) accordion!: boolean

    @Ref() subUL!: HTMLUListElement | HTMLUListElement[]

    @Ref() layersGroup!: { handleTotalFolders: () => void }

    filterOptions: Dictionary<string> = {
      SelectQuery: '',
      SelectType: ''
    }

    filterLayers: LayersType = {}

    @Watch('filterOptions', { deep: true, immediate: true })
    filter_handler(newVal: Dictionary<string>) {
      const copiedLayers = deepClone(this.layers)
      this.filterLayers = this.layersFilter({}, copiedLayers, newVal.SelectQuery)
    }

    layersFilter(result: LayersType, origin: LayersType, query: string) {
      Object.keys(origin).forEach((layer) => {
        const layerValue = origin[layer]
        if (typeof layerValue === 'string') {
          // 字符串
          if (layer.indexOf(query) !== -1) result[layer] = layerValue
        } else {
          // 对象
          const subRes = this.layersFilter({}, layerValue, query)
          if (Object.keys(subRes).length !== 0) result[layer] = subRes
        }
      })
      return result
    }

    mounted() {
      this.$broadOn(
        'onVisibleChange',
        (e: { label: string; type: 'folder' | 'layer'; isVisible: boolean }) => {
          const { label, isVisible } = e
          this.onVisibleChange(isVisible, label)
        }
      )
      this.$broadOn('onDetailsClick', (e: { label: string; type: 'folder' | 'layer' }) => {
        this.onDetailsClick(e.label, e.type)
      })
      this.$broadOn('onMouseEnter', (e: { label: string; type: 'folder' | 'layer' }) => {
        const { label, type } = e
        this.onMouseEnter(label, type)
      })
      this.$broadOn('onMouseLeave', () => {
        this.onMouseLeave()
      })
    }

    handleTotalFolders() {
      this.layersGroup.handleTotalFolders()
    }

    @Emit('onMouseEnter')
    onMouseEnter(label: string, type: 'layer' | 'folder') {
      return { label, type }
    }

    @Emit('onMouseLeave')
    onMouseLeave() {}

    @Emit('onVisibleChange')
    onVisibleChange(isVisible: boolean, label: string) {
      return { label, isVisible }
    }

    @Emit('onDetailsClick')
    onDetailsClick(label: string, type: 'folder' | 'layer') {
      return { label, type }
    }
  }
  export default WsLayersList
</script>

<style lang="less" scoped>
  @import '~@/styles/theme.less';
  @import '~@/styles/layout.less';
  @import '~@/styles/mixin_button.less';
  .ws_layers_list_module {
    position: relative;
    height: 100%;
    height: 100%;
    overflow: auto;
    .select-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 50px;
      box-sizing: border-box;
      z-index: 2;
      #flex(row, center, space-between);
      #color(background-color, --module-bg-color);
      i {
        margin: 0 10px;
      }
    }
    .list-container {
      margin-top: 50px;
      .is-fold {
        height: 0;
        overflow: hidden;
      }
    }
  }
  ::-webkit-scrollbar {
    width: 0;
  }
</style>
