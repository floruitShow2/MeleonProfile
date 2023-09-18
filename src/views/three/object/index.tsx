import { defineComponent, onMounted, ref } from 'vue'
import Game from './General/Game'
import './index.less'

export default defineComponent({
  setup() {
    const gameRef = ref()

    const game = ref<Game>()
    onMounted(() => {
      game.value = new Game(gameRef.value)
    })
    return () => (
      <div class="ws-object" id="container">
        <canvas ref={gameRef} class="game" />
      </div>
    )
  }
})
