import EnhancementContextPadProvider from './ContextPadProvider'
import EnhancementPaletteProvider from './PaletteProvider'
import EnhancementReplaceMenuProvider from './ReplaceMenuProvider'

import CustomCreatePopupProvider from './CreatePopupProvider'
import CustomAppendPopupProvider from './AppendPopupProvider'

const Providers = [
  {
    __init__: ['customCreatePopupProvider', 'customAppendPopupProvider'],
    // 覆盖部分
    contextPadProvider: ['type', EnhancementContextPadProvider],
    replaceMenuProvider: ['type', EnhancementReplaceMenuProvider],
    paletteProvider: ['type', EnhancementPaletteProvider],

    // 新增部分
    customCreatePopupProvider: ['type', CustomCreatePopupProvider],
    customAppendPopupProvider: ['type', CustomAppendPopupProvider]
  }
]

export default Providers
