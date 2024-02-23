import { defineComponent, ref, toRefs, onMounted } from 'vue'
import type { PropType } from 'vue'
import './index.less'

export default defineComponent({
  props: {
    team: {
      type: Object as PropType<ApiTeam.TeamEntity>,
      default: () => {}
    }
  },
  setup(props) {
    const { team } = toRefs(props)
    const initMembersList = (teamId: string) => {
      console.log(teamId)
    }

    return () => <div class="member-modal"></div>
  }
})
