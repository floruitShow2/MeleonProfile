import { defineComponent } from 'vue'
import './index.less'

export default defineComponent({
  setup() {
    const uploadTip = '暂时仅支持上传 MD 文档。请在上传前检查文档图片路径，本地路径的图片会上传失败'
    return () => (
      <div class="art-import-container">
        <a-upload draggable action="/" tip={uploadTip} />
      </div>
    )
  }
})
