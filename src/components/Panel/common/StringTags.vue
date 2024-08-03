<script setup lang="ts">
  import { InputInstance } from '@arco-design/web-vue'
  import { PropType } from 'vue'

  defineOptions({ name: 'StringTags' })

  const $props = defineProps({
    value: {
      type: String as PropType<string>,
      default: undefined
    },
    btnText: {
      type: String as PropType<string>,
      default: undefined
    }
  })
  const $emits = defineEmits(['update:value', 'change'])

  const computedTags = computed(() =>
    $props.value && $props.value.length ? $props.value.split(',') : []
  )

  const inputRef = ref<InputInstance | null>(null)
  const showInput = ref(false)
  const inputVal = ref('')

  const handleEdit = () => {
    showInput.value = true

    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus()
      }
    })
  }

  const handleAdd = () => {
    if (inputVal.value) {
      computedTags.value.push(inputVal.value)
      inputVal.value = ''
    }
    showInput.value = false
    updateModalValue()
  }

  const handleRemove = (_: string, idx: number) => {
    computedTags.value.splice(idx, 1)
    updateModalValue()
  }

  const updateModalValue = () => {
    const modalValue = computedTags.value.join(',')
    $emits('update:value', modalValue)
    $emits('change', modalValue)
  }
</script>

<template>
  <a-space wrap>
    <a-tag
      v-for="(tag, idx) of computedTags"
      :key="tag"
      size="Medium"
      color="arcoblue"
      closable
      @close="handleRemove(tag, idx)"
    >
      {{ tag }}
    </a-tag>

    <a-input
      v-if="showInput"
      ref="inputRef"
      v-model.trim="inputVal"
      @keyup.enter="handleAdd"
      @blur="handleAdd"
    />
    <a-tag v-else color="arcoblue" size="Medium" :style="{ cursor: 'pointer' }" @click="handleEdit">
      <template #icon>
        <icon-plus />
      </template>
      {{ btnText || 'addTag' }}
    </a-tag>
  </a-space>
</template>
