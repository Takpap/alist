<!-- components/preview/VideoPreview.vue -->
<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
    <div class="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
      <div ref="videoContainer" class="w-full h-full flex items-center justify-center"></div>

      <!-- 旋转控制按钮 -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button
          class="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-black/40"
          @click="handleRotate('left')"
          title="向左旋转 [快捷键: []"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
          </svg>
        </button>
        <button
          class="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-black/40"
          @click="handleRotate('right')"
          title="向右旋转 [快捷键: ]]"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
          </svg>
        </button>
      </div>

      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-black/40"
        @click="$emit('update:modelValue', null)"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const videoContainer = ref<HTMLElement | null>(null)

// 处理旋转
const handleRotate = (direction: 'left' | 'right') => {
  if (typeof rotateHandler === 'function') {
    rotateHandler(direction)
  }
}

// 旋转处理函数
let rotateHandler: ((direction: 'left' | 'right') => void) | undefined

// 监听键盘事件
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (props.modelValue) {
      if (e.key === '[') handleRotate('left')
      if (e.key === ']') handleRotate('right')
    }
  }
  window.addEventListener('keydown', handleKeydown)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})

watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    // 清理视频容器
    if (videoContainer.value) {
      videoContainer.value.innerHTML = ''
    }
    // 清理旋转处理函数
    rotateHandler = undefined
  }
}, { immediate: true })

// 暴露给父组件
defineExpose({
  videoContainer,
  setRotateHandler: (handler: typeof rotateHandler) => {
    rotateHandler = handler
  }
})
</script>

<style>
.plyr {
  width: 100%;
  height: 100%;
  max-width: 90vw;
  max-height: 90vh;
}

.plyr video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

/* 自定义旋转按钮样式 */
.plyr__control[data-plyr="rotate"] {
  order: 7;
}

/* 控制栏样式调整 */
.plyr__controls {
  gap: 0.5rem;
}
</style> 