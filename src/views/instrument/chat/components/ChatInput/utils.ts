import { NodeType } from './type'
import type { IPerson, INode, IMention } from './type'
// 获取当前光标选取的信息（即在弹出选人之前，把输入框中此刻的光标位置先记下来）
export const getEditorRange = () => {
  let range = null
  let selection = null
  if (window.getSelection) {
    selection = window.getSelection()
    if (selection && selection.getRangeAt && selection.rangeCount) {
      range = selection.getRangeAt(0)
      return {
        range,
        selection
      }
    }
    return null
  }
  return null
}

// 重新设置光标的位置
export const resetRange = (range: Range) => {
  if (range) {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
      // @ts-ignore
    } else if (range.select) {
      // @ts-ignore
      range.select()
    }
  }
}

// 数据类型转换  NodeList => MentionData
export const transformNodeListToMentionData = (nodeList: INode[]) => {
  let pureString = ''
  const mentionList: IMention[] = []
  nodeList.forEach((item) => {
    if (item.type === NodeType.text || item.type === NodeType.br) {
      pureString += item.data
    }
    if (item.type === NodeType.at) {
      const { id = '0', userName = '' } = item.data as IPerson
      mentionList.push({
        id,
        userName,
        length: userName.length + 1,
        offset: pureString.length
      })
      pureString += `@${userName} `
    }
  })
  return { pureString, mentionList }
}

export const transformMentionDataToNodeList = (
  pureString: string,
  mentionList: IMention[]
): INode[] => {
  let cutStart = 0
  const nodeList: INode[] = []
  if (mentionList.length > 0) {
    mentionList.forEach((item) => {
      const { offset, length: nameLength } = item
      const textPart = pureString.slice(cutStart, offset)
      if (textPart.length > 0) {
        nodeList.push({
          type: NodeType.text,
          data: textPart
        })
      }
      nodeList.push({
        type: NodeType.at,
        data: {
          id: item.id,
          userName: item.userName
        }
      })
      cutStart = offset + nameLength
    })
    const remainText = pureString.slice(cutStart)
    if (remainText.length > 0) {
      nodeList.push({
        type: NodeType.text,
        data: remainText
      })
    }
  } else if (pureString.length > 0) {
    nodeList.push({
      type: NodeType.text,
      data: pureString
    })
  }
  return nodeList
}
