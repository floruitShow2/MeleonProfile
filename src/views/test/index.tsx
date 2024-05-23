import { defineComponent, onMounted, ref } from 'vue'
import { GestureLock, GestureLockMode, GestureEvents } from '@meleon/lock'
import style from './index.module.less'

export default defineComponent({
  setup() {
    const lockInstance = ref<GestureLock>()
    onMounted(() => {
      const lock = new GestureLock({
        chooseType: 3,
        mode: GestureLockMode.INPUT_PASSWORD,
        canvasId: 'gesture-canvas',
        titleId: 'gesture-title',
        colorMap: {
          '--primary-color': '#175fff',
          '--info-color': 'red'
        },
        width: 300,
        height: 300
      })

      lockInstance.value = lock
      console.log(lockInstance.value)
      lockInstance.value.setPassword('1235789')
      lockInstance.value.on(GestureEvents.PASS, (val: string) => {
        console.log('passed value', val)
      })
      lockInstance.value.on(GestureEvents.SETTLE, (val: string) => {
        console.log('settled value', val)
      })
      lockInstance.value.on(GestureEvents.VERIFY_FAILED, (val: string) => {
        console.log('failed value', val)
      })
    })

    return () => (
      <div class={style['test-wrapper']}>
        <div class={style['test-wrapper-frame']}>
          <div id="gesture-title" class={style['test-wrapper-frame--title']}></div>
          <div class={style['test-wrapper-frame--content']}>
            <canvas id="gesture-canvas"></canvas>
          </div>
        </div>
      </div>
    )
  }
})
