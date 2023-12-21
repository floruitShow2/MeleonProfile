import { VNode } from 'vue'
import { isElement, isComponent, isArrayChildren } from './useIs'

const getAllElements = (children: VNode[]) => {
  const result: VNode[] = []
  for (const child of children) {
    if (isElement(child) || isComponent(child)) {
      result.push(child)
    }
    if (isArrayChildren(child)) {
      result.push(...getAllElements(child.children as VNode[]))
    }
  }
  return result
}

export { getAllElements }
