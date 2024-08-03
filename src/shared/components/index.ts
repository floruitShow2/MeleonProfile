import type { ComponentInstance, Plugin } from 'vue'
import MonacoEditor from './MonacoEditor.vue'

const components: ComponentInstance<any>[] = [MonacoEditor]

const plugin: Plugin = {
  install(app) {
    for (const component of components) {
      app.component(component.name, component)
    }
  }
}

export default plugin
