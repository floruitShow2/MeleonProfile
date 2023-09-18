import { defineComponent, ref } from 'vue'
import MaterialCard from '../Card'
import type { MaterialInstanceType } from '../interface'
import './index.less'

export default defineComponent({
  setup() {
    const materialList = ref<MaterialInstanceType[]>([])
    const handleAddMaterial = () => {
      const len = materialList.value.length
      const defaultMaterial: MaterialInstanceType = {
        id: len,
        name: `材质-${len}`,
        options: {
          color: 0xff0000,
          opacity: 1
        }
      }
      materialList.value.push(defaultMaterial)
    }
    return () => (
      <div class="material-manager">
        <i class="iconfont ws-plus ibtn_base ibtn_hover" onClick={handleAddMaterial}></i>
        {materialList.value.map((item) => (
          <MaterialCard instance={item} />
        ))}
      </div>
    )
  }
})
