import { createVNode, defineComponent, provide, ref, reactive } from 'vue'
import { Popover } from '@arco-design/web-vue'
import { getAllElements } from '@/utils/slots'
import { avatarGroupInjectionKey } from '~/src/components/avatar/context'
import './index.less'

export default defineComponent({
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    maxCount: {
      type: Number,
      default: 3
    }
  },
  setup(props, { slots }) {
    const total = ref(0)

    provide(
      avatarGroupInjectionKey,
      reactive({
        total
      })
    )

    return () => {
      const children = getAllElements((slots.default && slots.default()) || [])

      const limit =
        (props.maxCount > children.length && children.length) ||
        (props.maxCount < 0 && 0) ||
        props.maxCount

      const avatarsForRender = children.slice(0, limit)
      const avatarsForPopover = children.slice(limit)

      if (total.value !== avatarsForRender.length) {
        total.value = avatarsForRender.length
      }

      return (
        <>
          <div class="ws-avatar-group">
            {!props.disabled && avatarsForPopover.length > 0 ? (
              <Popover
                trigger="click"
                v-slots={{
                  content: () => (
                    <ul class="ws-avatar-group-popover">
                      {avatarsForPopover.map((avatar) => (
                        <li>
                          {createVNode(avatar)}{' '}
                          <span>
                            {createVNode(avatar.children && (avatar.children as any).default)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )
                }}
              >
                <div class="ws-avatar-group-wrapper">
                  {avatarsForRender.map((avatar) => createVNode(avatar))}
                </div>
              </Popover>
            ) : (
              <div class="ws-avatar-group-wrapper">
                {avatarsForRender.map((avatar) => createVNode(avatar))}
              </div>
            )}
          </div>
        </>
      )
    }
  }
})
