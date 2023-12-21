import { defineComponent, onMounted, ref } from 'vue'
import * as THREE from 'three'
import ThreeViewer, { type Experience, type AssetsType } from '@/components/threeViewer'
import './index.less'

export default defineComponent({
  setup() {
    const viewerRef = ref()
    const experience = ref<Experience | null>(null)

    const assets: AssetsType[] = [
      {
        name: 'model-01',
        path: 'http://localhost:3000/static/3DModels/turbine-01.glb'
      }
    ]

    const color = new THREE.Color('#0fb1fb')
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      depthTest: true,
      transparent: true
    })

    const getLine = (object: THREE.Mesh, thresholdAngle = 1, opacity = 1): THREE.LineSegments => {
      // 创建线条，参数为 几何体模型，相邻面的法线之间的角度，
      const edges = new THREE.EdgesGeometry(object.geometry, thresholdAngle)
      const line = new THREE.LineSegments(edges)
      material.opacity = opacity
      line.material = material
      return line
    }

    const changeModelMaterial = (mesh: THREE.Object3D, lineGroup: THREE.Group) => {
      if (mesh instanceof THREE.Mesh) {
        const quaternion = new THREE.Quaternion()
        const worldPos = new THREE.Vector3()
        const worldScale = new THREE.Vector3()
        // 获取四元数
        mesh.getWorldQuaternion(quaternion)
        // 获取位置信息
        mesh.getWorldPosition(worldPos)
        // 获取缩放比例
        mesh.getWorldScale(worldScale)

        mesh.material.transparent = true
        mesh.material.opacity = 0.4
        // 以模型顶点信息创建线条
        const line = getLine(mesh, 30, 1)
        // 给线段赋予模型相同的坐标信息
        line.quaternion.copy(quaternion)
        line.position.copy(worldPos)
        line.scale.copy(worldScale)

        lineGroup.add(line)
      }
    }

    const initLineGroups = (instance: Experience) => {
      // 拿到实际模型
      const model = instance.getActualModel()
      const lineGroup = new THREE.Group()
      model.traverse((mesh: THREE.Object3D) => changeModelMaterial(mesh, lineGroup))
      instance.scene.add(lineGroup)
    }

    onMounted(async () => {
      if (viewerRef.value) {
        experience.value = viewerRef.value.experience
      }
      if (experience.value) {
        await experience.value.loadModel(assets)
        initLineGroups(experience.value)
      }
    })

    return () => (
      <div class="ws-journey">
        <ThreeViewer ref={viewerRef} />
      </div>
    )
  }
})
