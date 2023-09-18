<template> </template>

<script lang="ts">
  import Vue from 'vue'
  import { Component, Prop } from 'vue-property-decorator'

  @Component
  class WsLayer extends Vue {
    @Prop({ required: true }) label!: string

    @Prop({ default: 'layer' }) type!: 'layer' | 'folder'

    @Prop({ default: 0 }) level!: number

    @Prop({ default: false }) folded!: boolean

    @Prop({ default: true }) parentLayerVisible!: boolean

    isLock = false

    isVisible = true

    isSelected = false

    get LayerOffsetLeft() {
      if (this.type === 'layer') return this.level === 0 ? 10 : this.level * 30
      return 10
    }

    onVisibleClick() {
      this.isVisible = !this.isVisible
      this.$broadEmit('onVisibleChange', {
        label: this.label,
        type: this.type,
        isVisible: this.isVisible
      })
    }

    onDetailsClick() {
      this.$broadEmit('onDetailsClick', {
        label: this.label,
        type: this.type
      })
    }

    onMouseEnter() {
      this.$broadEmit('onMouseEnter', {
        label: this.label,
        type: this.type
      })
    }

    onMouseLeave() {
      this.$broadEmit('onMouseLeave', {
        label: this.label,
        type: this.type
      })
    }
  }
  export default WsLayer
</script>

<style lang="less" scoped>
  @import '~@/styles/theme.less';
  @import '~@/styles/layout.less';
  @import '~@/styles/mixin_button.less';
  .ws_layer_module {
    box-sizing: border-box;
    position: relative;
    padding: 10px;
    border: solid 1px;
    #flex(row, center, flex-start);
    #color(border-color, --module-bg-color);
    #color(background-color, --module-bg-color);
    span,
    i {
      #color(color, --primary-text-color);
    }
    .dot {
      display: inline-block;
      box-sizing: border-box;
      padding: 5px;
      border-radius: 50%;
      #color(background-color, --lighter-blue-color);
    }
    .main {
      #flex(row, center, flex-start);
      span {
        margin-left: 5px;
        font-size: 14px;
      }
      .icon-arrow-up {
        transition: all 0.2s ease;
        transform: rotate(90deg);
      }
      .is-folded {
        transform: rotate(180deg);
      }
    }
    .is-not-visible {
      span,
      i {
        #color(color, --lighter-text-color);
      }
    }
    .toolList {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      #flex(row, center, flex-end);
      i {
        display: none;
        font-size: 16px;
        margin-left: 5px;
      }
      i:last-child {
        font-size: 18px;
      }
      .icon-lock {
        display: inline-block;
      }
    }
  }
  .ws_layer_module:hover {
    #color(border-color, --primary-blue-color);
    .toolList > i {
      display: inline-block;
    }
  }
  .is-folder > .main {
    span,
    i {
      font-weight: 600;
    }
  }
  .is-selected {
    #color(background-color, --gray-blue-color);
  }
</style>
