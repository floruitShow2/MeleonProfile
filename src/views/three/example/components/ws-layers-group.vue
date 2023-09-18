<template>
  <div class="layers_group_module">
    <div v-for="(layer, label) in layers" :key="label">
      <template v-if="Object.prototype.toString.call(layer) === '[object String]'">
        <ws-layer
          :label="label.toString()"
          type="layer"
          :level="level"
          :parent-layer-visible="computeParentVisible(label.toString())"
        />
      </template>
      <template v-else>
        <ws-layer
          :label="label.toString()"
          type="folder"
          :folded="activeFolders.includes(label.toString())"
          :parent-layer-visible="computeParentVisible(label.toString())"
          @click.native="handleFolder(label.toString())"
        />
        <ul
          ref="subUL"
          :class="{
            'is-fold': !activeFolders.includes(label.toString())
          }"
        >
          <ws-layers-group :layers="layer" :total-layers="totalLayers" :level="level + 1" />
        </ul>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
  import Vue from 'vue'
  import { Component, Prop, Emit, Ref } from 'vue-property-decorator'
  import { LayersType } from '../Methods/Layers'
  import WsLayer from './ws-layer.vue'
  import { deepClone } from '@/utils/specificFunc'

  @Component({
    name: 'WsLayersGroup',
    components: {
      WsLayer
    }
  })
  class WsLayersGroup extends Vue {
    @Prop({ required: true }) layers!: LayersType

    @Prop({ required: true }) totalLayers!: LayersType

    @Prop({ default: 0 }) level!: number

    // 是否开启手风琴模式
    @Prop({ default: false }) accordion!: boolean

    @Ref() subUL!: HTMLUListElement | HTMLUListElement[]

    mounted() {
      this.$broadOn(
        'onVisibleChange',
        (e: { label: string; type: 'folder' | 'layer'; isVisible: boolean }) => {
          const { label, type, isVisible } = e
          this.onVisibleChange(isVisible, label, type)
        }
      )
    }

    activeFolders: string[] = []

    hiddenFolders: string[] = []

    getSubUlListElement(folderName: string) {
      const ulList = this.subUL
      const result = Object.keys(this.layers).filter(
        (label) => Object.prototype.toString.call(this.layers[label]) !== '[object String]'
      )
      const idx = result.indexOf(folderName)
      if (idx === -1) {
        this.$message({
          type: 'warning',
          message: '点击的图层不存在于计算出的分组列表中'
        })
      } else {
        return Array.isArray(ulList) ? ulList[idx] : ulList
      }
    }

    handleFolder(folderName: string) {
      if (this.accordion) {
        this.handleFolderAccordion(folderName)
        return
      }
      const idx = this.activeFolders.indexOf(folderName)
      if (idx !== -1) {
        // 展开状态
        this.activeFolders.splice(idx, 1)
        this.animateFolder(folderName, 'close')
      } else {
        // 折叠状态
        this.activeFolders.push(folderName)
        this.$nextTick(() => {
          this.animateFolder(folderName, 'open')
        })
      }
    }

    handleTotalFolders() {
      if (this.activeFolders.length !== 0) {
        this.activeFolders.forEach((folderName) => this.handleFolder(folderName))
        this.$nextTick(() => {
          this.activeFolders = []
        })
      } else {
        const totalFolders = Object.keys(this.layers).filter(
          (label) => Object.prototype.toString.call(this.layers[label]) !== '[object String]'
        )
        totalFolders.forEach((folderName) => this.handleFolder(folderName))
        this.$nextTick(() => {
          this.activeFolders = totalFolders
        })
      }
    }

    handleFolderAccordion(folderName: string) {
      if (this.activeFolders.length === 0) {
        // 所有部门均处于折叠状态
        this.activeFolders = [folderName]
        this.$nextTick(() => {
          this.animateFolder(folderName, 'open')
        })
      } else if (this.activeFolders[0] !== folderName) {
        // 其他部门处于折叠状态
        const origin_title = this.activeFolders[0]
        this.animateFolder(origin_title, 'close')
        this.activeFolders = [folderName]
        this.$nextTick(() => {
          this.animateFolder(folderName, 'open')
        })
      } else {
        // 展开状态
        this.activeFolders = []
        this.animateFolder(folderName, 'close')
      }
    }

    animateFolder(folderName: string, type: 'open' | 'close') {
      const ulDom = this.getSubUlListElement(folderName)
      if (!ulDom) return
      const { height } = ulDom.getBoundingClientRect()
      if (type === 'close') {
        ulDom.animate([{ height: `${height}px` }, { height: 0 }], { duration: 300 })
      } else {
        ulDom.animate([{ height: 0 }, { height: `${height}px` }], { duration: 300 })
      }
    }

    @Emit('onVisibleChange')
    onVisibleChange(isVisible: boolean, label: string, type?: 'folder' | 'layer') {
      if (type && type === 'folder') {
        const idx = this.hiddenFolders.indexOf(label)
        idx === -1 ? this.hiddenFolders.push(label) : this.hiddenFolders.splice(idx, 1)
      }
      return { label, isVisible }
    }

    computeParentVisible(label: string) {
      const copiedLayers = deepClone(this.totalLayers)
      function DFS(layers: LayersType, target: string, res: string[] = []): void {
        const keys = Object.keys(layers)
        for (let i = 0; i < keys.length; i++) {
          const layer = layers[keys[i]]
          if (typeof layer === 'string') {
            if (keys[i] === target) result = [...res, keys[i]]
          } else {
            DFS(layer, target, [...res, keys[i]])
          }
        }
      }
      let result: string[] = []
      DFS(copiedLayers, label, result)
      return !this.hiddenFolders.some((item) => result.includes(item))
    }
  }
  export default WsLayersGroup
</script>

<style lang="less" scoped>
  .layers_group_module {
    .is-fold {
      height: 0;
      overflow: hidden;
    }
  }
</style>
