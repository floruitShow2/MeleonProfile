<script lang="ts" setup>
  import { downloadFile, setEncoded, SVGToImage } from '@/utils/files'
  import { modelerKey } from '@/injection-keys'

  const modeler = inject(modelerKey)

  const downloadProcess = async (type: string, name = 'diagram') => {
    try {
      // 按需要类型创建文件并下载
      if (type === 'xml' || type === 'bpmn') {
        const { error, xml } = await modeler!.value!.saveXML({})
        // 读取异常时抛出异常
        if (error) {
          console.error(`[Process Designer Warn ]: ${error.message || error}`)
        }
        const { href, filename } = setEncoded(type.toUpperCase(), name, xml!)
        downloadFile(href, filename)
      } else {
        const { svg } = await modeler!.value!.saveSVG()
        // 读取异常时抛出异常
        const { href, filename } = setEncoded('SVG', name, svg!)
        downloadFile(href, filename)
      }
    } catch (e: any) {
      console.error(`[Process Designer Warn ]: ${e.message || e}`)
    }
  }

  const downloadProcessAsXml = () => {
    downloadProcess('xml')
  }
  const downloadProcessAsBpmn = () => {
    downloadProcess('bpmn')
  }
  const downloadProcessAsSvg = () => {
    downloadProcess('svg')
  }

  const downloadProcessAsPng = async () => {
    const { svg } = await modeler!.value!.saveSVG()
    const blob = await SVGToImage({ svg, outputFormat: 'blob' })

    if (!blob) {
      // return window.__messageBox.error('导出失败')
    }

    if (blob instanceof Blob) {
      downloadFile(URL.createObjectURL(blob), 'diagram')
    }
  }
</script>

<template>
  <a-popover>
    <template #content>
      <div class="button-list_column">
        <a-button type="primary" @click="downloadProcessAsBpmn">
          {{ $t('exportAsBPMN') }}
        </a-button>
        <a-button type="primary" @click="downloadProcessAsXml">
          {{ $t('exportAsXML') }}
        </a-button>
        <a-button type="primary" @click="downloadProcessAsSvg">
          {{ $t('exportAsSVG') }}
        </a-button>
        <a-button type="primary" @click="downloadProcessAsPng">
          {{ $t('exportAsPNG') }}
        </a-button>
      </div>
    </template>

    <a-button type="primary" secondary>
      <LucideIcon name="Download" :size="16" />
      {{ $t('exportAs') }}</a-button
    >
  </a-popover>
</template>
