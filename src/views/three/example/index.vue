<template>
  <div class="base_three_module">
    <div ref="canvasWrapper" class="experience">
      <canvas ref="canvas" class="experience-canvas"></canvas>
      <transition name="slide-right">
        <div v-if="isModelsLayersShow" class="layers">
          <ws-layers-list
            :layers="layers"
            @onMouseEnter="onMouseEnter"
            @onMouseLeave="onMouseLeave"
            @onVisibleChange="onVisibleChange"
            @onDetailsClick="onDetailsClick"
          />
        </div>
      </transition>
      <ws-float-toolbox ref="WsToolbox" class="float-toolbox" direction="horizontal" size="small">
        <i class="iconfont icon-integral" @click="displayModelsLayers" />
      </ws-float-toolbox>
      <ws-display-frame
        v-if="selectedLayer.isVisible"
        ref="DisplayFrame"
        :title="selectedLayer.title"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import Vue, { ComponentInstance } from 'vue'
  import * as THREE from 'three'
  import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
  import { Component, Ref, Watch } from 'vue-property-decorator'

  import { Getter } from 'vuex-class'
  import { Dictionary } from 'vue-router/types/router'
  import WsLayersList from './components/ws-layers-list.vue'
  import WsFloatToolbox from '@/components/tool/ws-float-toolbox.vue'
  import WsDisplayFrame from './components/ws-display-frame.vue'

  @Component({
    components: {
      WsLayersList,
      WsDisplayFrame,
      WsFloatToolbox
    }
  })
  class Three extends Vue {
    @Getter('sidebar') sidebar!: { opened: boolean }

    @Watch('sidebar.opened')
    so_handler() {
      this.experience.sizes.resize()
      this.experience.resize()
    }

    @Ref() canvas!: HTMLCanvasElement

    @Ref() canvasWrapper!: HTMLElement

    @Ref() WsToolbox!: { getSizes: () => Dictionary<number> }

    @Ref() DisplayFrame!: ComponentInstance

    experience!: Experience

    initialToolboxPosition: Dictionary<number> = {
      right: 30,
      bottom: 30
    }

    mounted() {}

    layers: Dictionary<any> = {}

    isModelsLayersShow = false

    displayModelsLayers() {
      this.layers = this.experience.world.room.layers
      this.isModelsLayersShow = true
    }

    onMouseEnter(e: { label: string; type: 'layer' | 'folder' }) {
      const { label, type } = e
      const hoverObject = this.experience.scene.getObjectByName(label)
      if (!hoverObject) return
      const maskName = 'maskObject'
      const vector3 = new THREE.Vector3()
      const maskMaterial = new THREE.MeshBasicMaterial({
        color: 0xffba00,
        transparent: true, // 设置为true，opacity才会生效
        side: THREE.DoubleSide,
        opacity: 0.6,
        depthWrite: false
      })
      if (type === 'folder') {
        const objectsGroup = hoverObject as THREE.Group
        const worldVector3 = objectsGroup.getWorldPosition(vector3)
        const maskObject = objectsGroup.clone()
        maskObject.name = maskName
        maskObject.scale.set(0.11, 0.11, 0.11)
        maskObject.position.copy(worldVector3)
        maskObject.rotation.copy(objectsGroup.rotation)
        maskObject.children.forEach((object) => {
          const objectMesh = object as THREE.Mesh
          objectMesh.material = maskMaterial
        })
        this.experience.scene.add(maskObject)
      } else if (type === 'layer') {
        const objectMesh = hoverObject as THREE.Mesh
        const worldVector3 = objectMesh.getWorldPosition(vector3)
        const maskObject = objectMesh.clone()
        maskObject.name = maskName
        maskObject.scale.set(0.11, 0.11, 0.11)
        maskObject.position.copy(worldVector3)
        if (objectMesh.parent && objectMesh.parent.name !== 'Scene') {
          maskObject.rotation.copy(objectMesh.parent.rotation)
        }
        maskObject.material = maskMaterial
        this.experience.scene.add(maskObject)
      }
    }

    onMouseLeave() {
      const { scene } = this.experience
      const object = scene.getObjectByName('maskObject')
      if (!object) return
      scene.remove(object)
      this.onMouseLeave()
    }

    onVisibleChange(e: { label: string; isVisible: boolean }) {
      const { label, isVisible } = e
      const findObj = this.experience.scene.getObjectByName(label)
      if (!findObj) return
      findObj.visible = isVisible
    }

    selectedLayer: Dictionary<any> = {
      isVisible: false,
      title: ''
    }

    onDetailsClick(e: { label: string; type: 'folder' | 'layer' }) {
      const { label } = e
      const cardName = 'data_annotation_card'
      const lineName = 'data_annotation_line'
      const { scene } = this.experience
      const findLine = scene.getObjectByName(lineName)
      const findObj = scene.getObjectByName(label)
      if (findLine) scene.remove(findLine)
      if (!findObj) return
      this.selectedLayer.isVisible = true
      this.selectedLayer.title = label
      // renderer
      const css3dRenderer = new CSS3DRenderer()
      const { width, height } = this.experience.sizes
      css3dRenderer.setSize(width, height)
      css3dRenderer.domElement.style.position = 'absolute'
      css3dRenderer.domElement.style.top = '0'
      css3dRenderer.domElement.style.left = '0'
      css3dRenderer.domElement.style.pointerEvents = 'none'
      this.canvasWrapper.appendChild(css3dRenderer.domElement)
      this.$nextTick(() => {
        const vector3 = new THREE.Vector3()
        let worldVector3 = findObj.getWorldPosition(vector3)
        if (findObj instanceof THREE.Mesh && findObj.parent && findObj.parent.name !== 'Scene') {
          findObj.updateMatrixWorld(true)
          findObj.geometry.computeBoundingSphere()
          const center = findObj.geometry.boundingSphere.center.clone()
          findObj.localToWorld(center)
          worldVector3 = center
        }
        const { x: wx, y: wy, z: wz } = worldVector3
        const [cx, cy, cz] = [wx + 0.5, wy + 0.5, wz]
        const cardWorldVector3 = new THREE.Vector3(cx, cy, cz)
        const { x, y, z } = findObj.scale
        const css3dObject = new CSS3DObject(this.DisplayFrame.$el as HTMLElement)
        css3dObject.name = cardName
        css3dObject.position.copy(cardWorldVector3)
        css3dObject.scale.set(x * 0.002, y * 0.002, z * 0.002)
        // line
        const lineMaterial = new THREE.LineBasicMaterial({ color: '#0487E2' })
        const points = this.getCurvePoints(worldVector3, cardWorldVector3)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(lineGeometry, lineMaterial)
        line.name = lineName
        this.experience.scene.add(css3dObject, line)
        // camera
        const camera = this.experience.camera.perspectiveCamera
        // render
        css3dRenderer.render(this.experience.scene, camera)
        this.experience.time.on('update', () => {
          css3dRenderer.render(this.experience.scene, camera)
        })
      })
    }

    getCurvePoints(worldVector3: THREE.Vector3, cardWorldVector3: THREE.Vector3) {
      const { x: wx, y: wy, z: wz } = worldVector3
      const { x: cx, y: cy, z: cz } = cardWorldVector3
      const [mx, my, mz] = [(wx + cx) / 2, (wy + cy) / 2, (wz + cz) / 2]
      const firControlPoint = [(wx + mx + 0.3) / 2, (wy + my - 0.3) / 2, (wz + mz) / 2]
      const secControlPoint = [(cx + mx - 0.3) / 2, (cy + my + 0.3) / 2, (cz + mz) / 2]
      const curve = new THREE.CubicBezierCurve3(
        worldVector3,
        new THREE.Vector3(...firControlPoint),
        new THREE.Vector3(...secControlPoint),
        cardWorldVector3
      )
      return curve.getPoints(50)
    }
  }
  export default Three
</script>

<style lang="less" scoped>
  @import '~@/styles/theme.less';
  @import '~@/styles/layout.less';
  @import '~@/styles/animation.less';
  .base_three_module {
    box-sizing: border-box;
    padding: 10px 20px;
    height: calc(100vh - 50px);
    #flex(row, flex-start, flex-start);
    #color(background-color, --primary-bg-color);
  }
</style>
