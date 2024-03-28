import { defineComponent, ref } from 'vue'
import { useBus } from '@/utils/common'
import { EditorEvents } from '@/views/three/example/type'
import MaterialCard from '../Card'
import './index.less'

export default defineComponent({
  setup() {
    const materialList = ref<ThreeEditor.MaterialInstanceType[]>([])
    const handleAddMaterial = () => {
      const len = materialList.value.length
      const defaultMaterial: ThreeEditor.MaterialInstanceType = {
        id: len,
        name: `材质-${len}`,
        options: {
          color: '#ffffff',
          opacity: 1
        }
      }
      materialList.value.push(defaultMaterial)
    }

    const $bus = useBus()

    // 监听到材质编辑器的变化事件
    $bus.on(EditorEvents.onMC, (instance) => {
      const backupInstance = instance as ThreeEditor.MaterialInstanceType
      const { id } = backupInstance
      const idx = materialList.value.findIndex((item) => item.id === id)
      if (idx !== -1) materialList.value.splice(idx, 1, backupInstance)
    })
    // 打开材质编辑器
    const handleCardClick = (instance: ThreeEditor.MaterialInstanceType) => {
      $bus.emit(EditorEvents.onMEO, instance)
    }

    return () => (
      <div class="material-manager">
        <div class="material-manage-header">
          <i
            class="iconfont ws-plus ibtn_base ibtn_mini ibtn_hover"
            onClick={handleAddMaterial}
          ></i>
        </div>
        <div class="material-manager-container">
          {materialList.value.map((item) => (
            <MaterialCard instance={item} onClick={handleCardClick} />
          ))}
        </div>
      </div>
    )
  }
})
