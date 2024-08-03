// 根据所需类型进行转码并返回下载地址
export function setEncoded(type: string, filename: string, data: string) {
  const encodedData: string = encodeURIComponent(data)
  return {
    filename: `${filename}.${type.toLowerCase()}`,
    href: `data:application/${
      type === 'svg' ? 'text/xml' : 'bpmn20-xml'
    };charset=UTF-8,${encodedData}`,
    data: data
  }
}

// 文件下载方法
export function downloadFile(href: string, filename: string) {
  if (href && filename) {
    const a: HTMLAnchorElement = document.createElement('a')
    a.download = filename //指定下载的文件名
    a.href = href //  URL对象
    a.click() // 模拟点击
    URL.revokeObjectURL(a.href) // 释放URL 对象
  }
}

type Settings = {
  svg: null | string | SVGElement
  width: string | number
  height: string | number
  mimetype: string
  outputFormat: string
  quality: number
}
export function SVGToImage(settings: Partial<Settings>): Promise<Blob | string | null> {
  const _settings: Settings = {
    svg: null,
    mimetype: 'image/png',
    quality: 0.92,
    width: 'auto',
    height: 'auto',
    outputFormat: 'base64'
  }

  // Override default settings
  for (const key in settings) {
    _settings[key] = settings[key]
  }

  return new Promise(function (resolve) {
    let svgNode: SVGElement

    // Create SVG Node if a plain string has been provided
    if (typeof _settings.svg == 'string') {
      // Create a non-visible node to render the SVG string
      const SVGContainer = document.createElement('div')
      SVGContainer.style.display = 'none'
      SVGContainer.innerHTML = _settings.svg
      svgNode = SVGContainer.firstElementChild as SVGElement
    } else {
      svgNode = _settings.svg!
    }

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    const svgXml = new XMLSerializer().serializeToString(svgNode)
    const svgBase64 = 'data:image/svg+xml;base64,' + btoa(svgXml)

    const image = new Image()

    image.onload = function () {
      let finalWidth, finalHeight

      if (_settings.width === 'auto' && _settings.height !== 'auto') {
        finalWidth = (image.width / image.height) * (_settings.height as number)
      } else if (_settings.width === 'auto') {
        finalWidth = image.naturalWidth
      } else {
        finalWidth = _settings.width
      }

      // Calculate height if set to auto and the width is specified (to preserve aspect ratio)
      if (_settings.height === 'auto' && _settings.width !== 'auto') {
        finalHeight = (image.height / image.width) * (_settings.width as number)
      } else if (_settings.height === 'auto') {
        finalHeight = image.naturalHeight
      } else {
        finalHeight = _settings.height
      }

      // Define the canvas intrinsic size
      canvas.width = finalWidth
      canvas.height = finalHeight

      // Render image in the canvas
      context!.drawImage(image, 0, 0, finalWidth, finalHeight)

      if (settings.outputFormat == 'blob') {
        canvas.toBlob(
          function (blob) {
            resolve(blob)
          },
          _settings.mimetype,
          _settings.quality
        )
      } else {
        resolve(canvas.toDataURL(_settings.mimetype, _settings.quality))
      }
    }

    image.src = svgBase64
  })
}
