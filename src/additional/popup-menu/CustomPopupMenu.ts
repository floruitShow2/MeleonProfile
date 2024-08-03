import PopupMenu, { PopupMenuConfig } from 'diagram-js/lib/features/popup-menu/PopupMenu'
import { PopupMenuEntries } from 'diagram-js/lib/features/popup-menu/PopupMenuProvider'
import EventBus from 'diagram-js/lib/core/EventBus'
import Canvas from 'diagram-js/lib/core/Canvas'

const specialHiddenEntries = ['append-task', 'append-rule-task', 'create-task', 'create-rule-task']

class CustomPopupMenu extends PopupMenu {
  _current: null | { entries: PopupMenuEntries }

  constructor(config: PopupMenuConfig, eventBus: EventBus, canvas: Canvas) {
    super(config, eventBus, canvas)
    this._current = null
  }

  _render() {
    const { entries } = this._current!

    for (const entriesKey in entries) {
      // @ts-expect-error
      entries[entriesKey].rank = specialHiddenEntries.includes(entriesKey) ? -1 : 1
    }

    // @ts-expect-error
    super._render()
  }
}

CustomPopupMenu.$inject = ['config.popupMenu', 'eventBus', 'canvas']

export default CustomPopupMenu
