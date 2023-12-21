declare module 'vue-grid-layout' {
  import { VueElement } from 'vue'

  export class GridItemEvent extends VueElement {
    w: number

    h: number

    x: number

    y: number

    maxW: number

    minW: number

    maxH: number

    minH: number

    i: string
  }

  export interface GridItemProps {
    x: number
    y: number
    w: number
    h: number
    i: string
    minW?: number
    maxW?: number
    minH?: number
    maxH?: number
    moved?: boolean
    static?: boolean
    isDraggable?: boolean
    isResizable?: boolean
    onDrag?(e: MouseEvent | TouchEvent, data: GridItemEvent): void
    onDragStart?(e: MouseEvent | TouchEvent, data: GridItemEvent): void
    onDragStop?(e: MouseEvent | TouchEvent, data: GridItemEvent): void
    onResize?(e: MouseEvent | TouchEvent, data: GridItemEvent): void
    onResizeStart?(e: MouseEvent | TouchEvent, data: GridItemEvent): void
    onResizeStop?(e: MouseEvent | TouchEvent, data: GridItemEvent): void
  }

  export class GridLayoutProps extends VueElement {
    layout?: GridItemProps[]

    rowHeight?: number

    cols?: number

    width?: number

    margin?: [number, number]

    containerPadding?: [number, number]

    autoSize?: boolean

    useCSSTransforms?: boolean

    draggableCancel?: string

    draggableHandle?: string

    verticalCompact?: boolean

    horizontalCompact?: boolean

    preventCollision?: boolean

    compactType?: 'vertical' | 'horizontal'

    resizeHandles?: string[]

    onLayoutChange?(layout: GridItemProps[]): void

    onDrag?(
      layout: GridItemProps[],
      oldItem: GridItemProps,
      newItem: GridItemProps,
      placeholder: GridItemProps
    ): void

    onDragStart?(
      layout: GridItemProps[],
      oldItem: GridItemProps,
      newItem: GridItemProps,
      placeholder: GridItemProps
    ): void

    onDragStop?(
      layout: GridItemProps[],
      oldItem: GridItemProps,
      newItem: GridItemProps,
      placeholder: GridItemProps
    ): void

    onResize?(layout: GridItemProps[], oldItem: GridItemProps, newItem: GridItemProps): void

    onResizeStart?(layout: GridItemProps[], oldItem: GridItemProps, newItem: GridItemProps): void

    onResizeStop?(layout: GridItemProps[], oldItem: GridItemProps, newItem: GridItemProps): void
  }

  export interface GridLayoutMethods {
    layout(): void
    moveItem(
      i: string,
      x: number,
      y: number,
      isUserAction?: boolean,
      preventCollision?: boolean
    ): void
    resizeItem(
      i: string,
      w: number,
      h: number,
      isUserAction?: boolean,
      preventCollision?: boolean
    ): void
    addItem(item: GridItemProps): void
    removeItem(i: string): void
    compact(): void
  }

  export const GridLayout: GridItemEvent
  export const GridItem: GridItemProps
}
