import { defineComponent, onMounted, ref, nextTick } from 'vue'
import * as THREE from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer'
import Experience from './General/Experience'
import {
  ThreeToolTab,
  ThreeShortCut,
  ThreeLayers,
  ThreeEditor,
  MaterialManager
} from './components'
import './index.less'

export default defineComponent({
  setup() {
    const canvasWrapperRef = ref()
    const canvasRef = ref()

    const experience = ref<null | Experience>(null)
    onMounted(() => {
      experience.value = new Experience(canvasRef.value, canvasWrapperRef.value)
    })

    const isMaterialShow = ref(true)
    const handleToolSelect = (value: string | number | Record<string, any>) => {
      if (value === 'window-material') {
        isMaterialShow.value = !isMaterialShow.value
      }
    }

    type LayerEvent = (e?: { label: string; type: 'layer' | 'folder'; isVisible?: boolean }) => void
    const onLayerMouseEnter: LayerEvent = (e) => {
      if (!experience.value || !e) return
      const { label, type } = e
      const hoverObject = experience.value.scene.getObjectByName(label)
      if (!hoverObject) return
      const maskName = 'maskObject'
      const vector3 = new THREE.Vector3()
      const maskMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
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
        maskObject.scale.set(0.1, 0.1, 0.1)
        maskObject.position.copy(worldVector3)
        maskObject.rotation.copy(objectsGroup.rotation)
        maskObject.children.forEach((object) => {
          const objectMesh = object as THREE.Mesh
          objectMesh.material = maskMaterial
        })
        experience.value.scene.add(maskObject)
      } else if (type === 'layer') {
        const objectMesh = hoverObject as THREE.Mesh
        const worldVector3 = objectMesh.getWorldPosition(vector3)
        const maskObject = objectMesh.clone()
        maskObject.name = maskName
        maskObject.scale.set(0.1, 0.1, 0.1)
        maskObject.position.copy(worldVector3)
        if (objectMesh.parent && objectMesh.parent.name !== 'Scene') {
          maskObject.rotation.copy(objectMesh.parent.rotation)
        }
        maskObject.material = maskMaterial
        experience.value.scene.add(maskObject)
      }
    }
    const onLayerMouseLeave: LayerEvent = () => {
      if (!experience.value) return
      const { scene } = experience.value
      const object = scene.getObjectByName('maskObject')
      if (!object) return
      scene.remove(object)
      onLayerMouseLeave()
    }
    const onLayerVisibleChange: LayerEvent = (e) => {
      if (!e || !experience.value) return
      const { label, isVisible } = e
      const findObj = experience.value.scene.getObjectByName(label)
      if (!findObj) return
      findObj.visible = isVisible || false
    }
    const selectedLayer = ref({
      isVisible: false,
      title: ''
    })
    const displayFrameRef = ref()
    const getCurvePoints = (worldVector3: THREE.Vector3, cardWorldVector3: THREE.Vector3) => {
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
    const onLayerDetailsClick: LayerEvent = (e) => {
      if (!e || !experience.value) return
      const { label } = e
      const cardName = 'data_annotation_card'
      const lineName = 'data_annotation_line'
      const { scene } = experience.value
      const findLine = scene.getObjectByName(lineName)
      const findObj = scene.getObjectByName(label)
      if (findLine) scene.remove(findLine)
      if (!findObj) return
      selectedLayer.value.isVisible = true
      selectedLayer.value.title = label
      // renderer
      const css3dRenderer = new CSS3DRenderer()
      const { width, height } = experience.value.sizes
      css3dRenderer.setSize(width, height)
      css3dRenderer.domElement.style.position = 'absolute'
      css3dRenderer.domElement.style.top = '0'
      css3dRenderer.domElement.style.left = '0'
      css3dRenderer.domElement.style.pointerEvents = 'none'
      canvasWrapperRef.value.appendChild(css3dRenderer.domElement)
      nextTick(() => {
        if (!experience.value) return
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
        const css3dObject = new CSS3DObject(
          '$el' in displayFrameRef.value
            ? (displayFrameRef.value.$el as HTMLElement)
            : displayFrameRef.value
        )
        css3dObject.name = cardName
        css3dObject.position.copy(cardWorldVector3)
        css3dObject.scale.set(x * 0.002, y * 0.002, z * 0.002)
        // line
        const lineMaterial = new THREE.LineBasicMaterial({ color: '#0487E2' })
        const points = getCurvePoints(worldVector3, cardWorldVector3)
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        const line = new THREE.Line(lineGeometry, lineMaterial)
        line.name = lineName
        experience.value.scene.add(css3dObject, line)
        // camera
        const camera = experience.value.camera.perspectiveCamera
        // render
        css3dRenderer.render(experience.value.scene, camera)
        experience.value.time.on('update', () => {
          if (!experience.value) return
          css3dRenderer.render(experience.value.scene, camera)
        })
      })
    }

    return () => (
      <div class="ws-three">
        <div class="ws-three-main">
          <div class="tools">
            <ThreeToolTab onSelect={handleToolSelect} />
            <ThreeShortCut />
          </div>
          <div ref={canvasWrapperRef} class="experience">
            <canvas ref={canvasRef} class="experience-canvas"></canvas>
            <div
              class="material"
              style={{
                width: isMaterialShow.value ? '200px' : 0
              }}
            >
              <MaterialManager />
            </div>
            <div ref={displayFrameRef}>aaa</div>
          </div>
        </div>
        <div class="ws-three-aside">
          {experience.value && (
            <ThreeLayers
              experience={experience.value}
              onMouseEnter={onLayerMouseEnter}
              onMouseLeave={onLayerMouseLeave}
              onVisibleChange={onLayerVisibleChange}
              onDetailClick={onLayerDetailsClick}
            />
          )}
          <ThreeEditor />
        </div>
      </div>
    )
  }
})
