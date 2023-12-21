// 获取文件名后缀
export function getExtend(name: string) {
  const dot = name.lastIndexOf('.')
  if (dot === -1) return ''
  return name.substring(dot + 1)
}

/**
 * @description 将文件大小从字节数转换为带符号的字符串
 * @param bytes 字节数
 * @param decimals
 * @returns
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / k ** i).toFixed(dm))}${sizes[i - 1]}`
}

// 将文件大小转换为指定单位
export function convertFileSize(
  size: string,
  targetUnit: 'B' | 'KB' | 'MB' | 'GB',
  withUnit = true
) {
  const units = ['B', 'KB', 'MB', 'GB']
  const targetIndex = units.indexOf(targetUnit)
  if (targetIndex === -1) {
    throw new Error('Invalid target unit')
  }
  const [value, unit] = size.split(/(?<=\d)(?=[A-Z])/)
  const unitIndex = units.indexOf(unit)
  if (unitIndex === -1) {
    throw new Error('Invalid unit in sizes')
  }
  const result = Number(value) * 1024 ** (unitIndex - targetIndex)
  return withUnit ? `${result} ${targetUnit}` : result.toString()
}

export function convertToBytes(text: string): number {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const unit = text.match(/[a-zA-Z]+/g)
  const matchResult = text.match(/[0-9.]+/g)
  if (!matchResult) {
    return 0
  }
  const value = parseFloat(matchResult[0])
  if (unit) {
    const index = units.indexOf(unit[0])
    return value * 1024 ** index
  }
  return value
}

// 根据文件类型生成对应的 Icon 后缀
export function generateFileIcon(filename: string) {
  const ext = getExtend(filename)
  if (['docx', 'doc'].includes(ext)) return 'doc'
  if (['xlsx', 'xls', 'csv'].includes(ext)) return 'xlsx'
  if (['jpeg', 'jpg', 'png'].includes(ext)) return 'jpeg'
  return ext
}
