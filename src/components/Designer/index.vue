<script setup lang="ts">
  import { PropType } from 'vue'
  import Modeler from 'bpmn-js/lib/Modeler'
  import Canvas from 'diagram-js/lib/core/Canvas'
  import { is } from 'bpmn-js/lib/util/ModelUtil'
  import { Linter } from 'bpmnlint'
  import FlowableDescriptor from '@/moddle/flowable.json'
  import emptyXml from '@/utils/empty-xml'
  import additionalModules from '@/additional'
  import { lintConfig } from '@/additional/lint'
  import EventEmitter from '@/utils/EventEmitter'
  import { addElementCreateInterceptor } from '@/additional/event-interceptor'
  import { getLocalStorage } from '@/utils/tools'
  // @ts-expect-error

  defineOptions({ name: 'BpmnDesigner' })

  const $props = defineProps({
    xml: {
      type: String as PropType<string>,
      default: undefined
    }
  })

  const $emits = defineEmits(['modeler-init', 'root-init'])

  const minimapEnable = getLocalStorage('minimap')?.enabled ?? true

  const canvasEl = ref<HTMLDivElement | undefined>(undefined)
  const bpmnModeler = shallowRef<Modeler | undefined>()

  const initModeler = () => {
    bpmnModeler.value = new Modeler({
      container: canvasEl.value!,
      moddleExtensions: {
        flowable: FlowableDescriptor
      },
      additionalModules,
      ...lintConfig,
      // 其他插件配置
      keyboard: { bindTo: document },
      minimap: { open: minimapEnable },
      gridLine: { gridLineOpacity: 0.1, gridLineStroke: 1 }
    })
    addElementCreateInterceptor(bpmnModeler.value)
    $emits('modeler-init', bpmnModeler.value)
    EventEmitter.emit('modeler-init', bpmnModeler.value)
  }

  const lint = () => {
    const definitions = bpmnModeler.value!.getDefinitions()

    const linter = new Linter(lintConfig.linting.bpmnlint)

    return linter.lint(definitions)
  }

  const createNewProcess = async (xml?: string) => {
    try {
      if (!bpmnModeler.value) {
        initModeler()
      }
      await bpmnModeler.value!.importXML(xml || $props.xml || emptyXml(`process_${Date.now()}`))

      const canvas = bpmnModeler.value!.get<Canvas>('canvas')

      canvas.zoom('fit-viewport')

      const element = canvas.getRootElement()
      let businessObject = element.businessObject
      // 存在泳池时，默认 "Collaboration" 节点替换为 "Process" 节点
      if (is(element, 'bpmn:Collaboration')) {
        businessObject = element.children[0].businessObject.processRef
      }

      $emits('root-init', { id: businessObject.get('id'), name: businessObject.get('name') })

      bpmnModeler.value!.on(
        ['import.done', 'elements.changed', 'linting.configChanged', 'linting.toggle'],
        200,
        async () => {
          console.log(await lint())
        }
      )
      bpmnModeler.value!.on('linting.completed', async ({ issues }: any) => {
        console.log(issues)
      })
    } catch (e) {
      console.error(e)
    }
  }

  onMounted(() => {
    initModeler()
    createNewProcess($props.xml)
  })

  defineExpose({ createNewProcess })
</script>

<template>
  <div ref="canvasEl" class="bpmn-designer">
    <slot />
  </div>
</template>
