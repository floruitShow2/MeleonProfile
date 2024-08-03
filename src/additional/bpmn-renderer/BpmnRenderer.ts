import BpmnRenderer from 'bpmn-js/lib/draw/BpmnRenderer'
import type {
  Attrs as BaseAttrs,
  BpmnRendererConfig as BaseBpmnRendererConfig
} from 'bpmn-js/lib/draw/BpmnRenderer'
import { black, getDi, getFillColor, getStrokeColor } from 'bpmn-js/lib/draw/BpmnRenderUtil'
import { append as svgAppend, create as svgCreate } from 'tiny-svg'
import { isObject } from 'min-dash'
import { is } from 'bpmn-js/lib/util/ModelUtil'
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil'
import EventBus from 'diagram-js/lib/core/EventBus'
import Styles from 'diagram-js/lib/draw/Styles'
import PathMap from '@/additional/bpmn-renderer/PathMap'
import Canvas from 'diagram-js/lib/core/Canvas'
import TextRenderer from 'bpmn-js/lib/draw/TextRenderer'

export type Attrs = BaseAttrs & {
  strokeWidth?: number
  opacity?: number
  transform?: string
}

export type BpmnRendererConfig = BaseBpmnRendererConfig & {
  overrideColor?: boolean
}

class CustomBpmnRenderer extends BpmnRenderer {
  _overrideColor: boolean

  constructor(
    config: BpmnRendererConfig,
    eventBus: EventBus,
    styles: Styles,
    pathMap: PathMap,
    canvas: Canvas,
    textRenderer: TextRenderer,
    priority: number
  ) {
    super(config, eventBus, styles, pathMap, canvas, textRenderer, priority)

    const handlers = this.handlers
    const defaultFillColor = config && config.defaultFillColor
    const defaultStrokeColor = config && config.defaultStrokeColor

    this._overrideColor = config?.overrideColor || false

    function lineStyle(attrs: Attrs) {
      return styles.computeStyle(attrs, ['no-fill'], {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: black,
        strokeWidth: 2
      })
    }
    function shapeStyle(attrs: Attrs) {
      return styles.computeStyle(attrs, {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        stroke: black,
        strokeWidth: 2,
        fill: 'white'
      })
    }
    function drawPath(parentGfx: SVGElement, d: string, attrs: Attrs) {
      attrs = lineStyle(attrs)
      const path = svgCreate('path', { ...attrs, d })
      svgAppend(parentGfx, path)
      return path
    }

    function drawCircle(
      parentGfx: SVGElement,
      width: number,
      height: number,
      offset: number,
      attrs: Attrs = {}
    ) {
      if (isObject(offset)) {
        attrs = offset
        offset = 0
      }
      offset = offset || 0
      attrs = shapeStyle(attrs)
      const cx = width / 2,
        cy = height / 2

      const circle = svgCreate('circle', {
        cx: cx,
        cy: cy,
        r: Math.round((width + height) / 4 - offset),
        ...attrs
      })

      svgAppend(parentGfx, circle)

      return circle
    }

    const customServiceRenderer = (
      parentGfx: SVGElement,
      element: BpmnElement,
      attrs: Attrs = {}
    ) => {
      attrs = pickAttrs(attrs, ['fill', 'stroke'])
      const task = handlers['bpmn:Task'](parentGfx, element, attrs)

      const childType = element.businessObject.get('type')

      const defaultStyles = {
        fill: getStrokeColor(element, defaultFillColor, attrs.stroke as string),
        stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke as string),
        strokeWidth: 0
      }
      const childGroup = svgCreate('g', { class: 'custom-node-marker' })
      parentGfx.insertBefore(childGroup, null)

      switch (childType) {
        case 'copy':
          const copyPath = pathMap.getStaticPath('SERVICE_COPY')
          drawPath(childGroup, copyPath, defaultStyles)
          break
        case 'camel':
          const camelPath = pathMap.getStaticPath('SERVICE_CAMEL')
          drawPath(childGroup, camelPath, defaultStyles)
          break
        case 'dmn':
          const dmnPath = pathMap.getStaticPath('SERVICE_DMN')
          drawPath(childGroup, dmnPath, defaultStyles)
          break
        case 'http':
          const httpPath1 = pathMap.getStaticPath('SERVICE_HTTP_1')
          drawPath(childGroup, httpPath1, defaultStyles)
          const httpPath2 = pathMap.getStaticPath('SERVICE_HTTP_2')
          drawPath(childGroup, httpPath2, defaultStyles)
          break
        case 'mail':
          const mailPath1 = pathMap.getStaticPath('SERVICE_MAIL_1')
          drawPath(childGroup, mailPath1, defaultStyles)
          const mailPath2 = pathMap.getStaticPath('SERVICE_MAIL_2')
          drawPath(childGroup, mailPath2, defaultStyles)
          break
        case 'mq':
          const mq1 = pathMap.getStaticPath('SERVICE_MQ_1')
          drawPath(childGroup, mq1, defaultStyles)
          const mq2 = pathMap.getStaticPath('SERVICE_MQ_2')
          drawPath(childGroup, mq2, defaultStyles)
          break
        case 'sc':
          const sc1 = pathMap.getStaticPath('SERVICE_SC_1')
          drawPath(childGroup, sc1, defaultStyles)
          const sc2 = pathMap.getStaticPath('SERVICE_SC_2')
          drawPath(childGroup, sc2, defaultStyles)
          break
        case 'rest':
          const rest1 = pathMap.getStaticPath('SERVICE_REST_1')
          drawPath(childGroup, rest1, defaultStyles)
          const rest2 = pathMap.getStaticPath('SERVICE_REST_2')
          drawPath(childGroup, rest2, defaultStyles)
          break
        default:
          // 渲染默认服务节点标志
          drawCircle(parentGfx, 10, 10, 0, {
            fill: getFillColor(element, defaultFillColor, attrs.fill as string),
            stroke: 'none',
            transform: 'translate(6, 6)'
          })
          const pathDataService1 = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
            abspos: {
              x: 12,
              y: 18
            }
          })
          drawPath(parentGfx, pathDataService1, {
            fill: getFillColor(element, defaultFillColor, attrs.fill as string),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke as string),
            strokeWidth: 1
          })
          drawCircle(parentGfx, 10, 10, 0, {
            fill: getFillColor(element, defaultFillColor, attrs.fill as string),
            stroke: 'none',
            transform: 'translate(11, 10)'
          })
          const pathDataService2 = pathMap.getScaledPath('TASK_TYPE_SERVICE', {
            abspos: {
              x: 17,
              y: 22
            }
          })
          drawPath(parentGfx, pathDataService2, {
            fill: getFillColor(element, defaultFillColor, attrs.fill as string),
            stroke: getStrokeColor(element, defaultStrokeColor, attrs.stroke as string),
            strokeWidth: 1
          })
      }

      return task
    }

    this.handlers['bpmn:ServiceTask'] = customServiceRenderer
  }

  drawShape(parentGfx: SVGElement, element: BpmnElement, attrs: Attrs = {}): SVGElement {
    let stroke: string | undefined
    if (!this._overrideColor) {
      const di = getDi(element)
      stroke = di.get('color:border-color') || di.get('bioc:stroke')
    }
    if (is(element, 'bpmn:Activity')) {
      attrs = { stroke: stroke || '#696969', ...attrs }
      return super.drawShape(parentGfx, element, attrs)
    }
    if (is(element, 'bpmn:StartEvent')) {
      attrs = { stroke: stroke || '#61c071', ...attrs }
      return super.drawShape(parentGfx, element, attrs)
    }
    if (is(element, 'bpmn:EndEvent')) {
      attrs = { stroke: stroke || '#d03050', ...attrs }
      return super.drawShape(parentGfx, element, attrs)
    }
    if (is(element, 'bpmn:Gateway')) {
      attrs = { stroke: stroke || '#fb863c', ...attrs }
      return super.drawShape(parentGfx, element, attrs)
    }
    if (is(element, 'bpmn:CatchEvent') || is(element, 'bpmn:ThrowEvent')) {
      attrs = { stroke: stroke || '#7431ac', ...attrs }
      return super.drawShape(parentGfx, element, attrs)
    }

    return super.drawShape(parentGfx, element, attrs)
  }

  drawConnection(parentGfx: SVGElement, element: BpmnElement, attrs: Attrs = {}): SVGElement {
    let stroke: string | undefined
    if (!this._overrideColor) {
      const di = getDi(element)
      stroke = di.get('color:border-color') || di.get('bioc:stroke')
    }
    if (isAny(element, ['bpmn:SequenceFlow', 'bpmn:Association'])) {
      attrs = { stroke: stroke || '#9cafcf', ...attrs }
      return super.drawConnection(parentGfx, element, attrs)
    }

    return super.drawConnection(parentGfx, element, attrs)
  }
}

function pickAttrs(attrs: Attrs, keys: string[] = []): Attrs {
  return keys.reduce((pickedAttrs, key) => {
    if (attrs[key]) {
      pickedAttrs[key] = attrs[key]
    }

    return pickedAttrs
  }, {})
}

export default CustomBpmnRenderer
