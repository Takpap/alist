<!-- components/preview/ImagePreview.vue -->
<template>
  <div v-if="modelValue" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/75" @click="closePreview">
    <!-- 加载动画 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
    </div>

    <!-- 图片 -->
    <Transition name="fade">
      <img
        v-show="!loading"
        :src="modelValue"
        class="max-w-[85vw] max-h-[85vh] object-contain transition-transform duration-200"
        :style="{
          transform: `scale(${scale}) rotate(${rotation}deg) translate(${translate.x}px, ${translate.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }"
        @click.stop
        @load="onImageLoad"
        @mousedown="startDrag"
        @wheel.prevent="handleWheel"
      />
    </Transition>

    <!-- 操作按钮 -->
    <div 
      v-show="!loading" 
      class="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-black/40 backdrop-blur-sm rounded-lg p-2"
      @click.stop
    >
      <button
        class="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        @click="zoomIn"
        title="放大"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      <button
        class="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        @click="zoomOut"
        title="缩小"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6" />
        </svg>
      </button>
      <div class="w-full h-px bg-white/20 my-1"></div>
      <button
        class="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        @click="rotateLeft"
        title="向左旋转"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
        </svg>
      </button>
      <button
        class="w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        @click="rotateRight"
        title="向右旋转"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
        </svg>
      </button>
    </div>

    <!-- 关闭按钮 -->
    <button
      class="fixed top-4 right-4 w-10 h-10 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm bg-black/40"
      @click.stop="closePreview"
      title="关闭"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const loading = ref(true)
const scale = ref(1)
const rotation = ref(0)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const translate = ref({ x: 0, y: 0 })

const onImageLoad = () => {
  console.log('Image loaded')
  loading.value = false
}

const closePreview = () => {
  emit('update:modelValue', null)
  // 重置状态
  scale.value = 1
  rotation.value = 0
  translate.value = { x: 0, y: 0 }
}

// 缩放功能
const zoomIn = () => {
  scale.value = Math.min(5, scale.value + 0.25)
}

const zoomOut = () => {
  scale.value = Math.max(0.25, scale.value - 0.25)
}

// 旋转功能
const rotateLeft = () => {
  rotation.value = (rotation.value - 90) % 360
}

const rotateRight = () => {
  rotation.value = (rotation.value + 90) % 360
}

// 滚轮缩放
const handleWheel = (e: WheelEvent) => {
  if (e.deltaY < 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

// 拖动功能
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragStart.value = {
    x: e.clientX - translate.value.x,
    y: e.clientY - translate.value.y
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.value) {
      translate.value = {
        x: e.clientX - dragStart.value.x,
        y: e.clientY - dragStart.value.y
      }
    }
  }

  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

// 监听图片变化时重置状态
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    loading.value = true
    scale.value = 1
    rotation.value = 0
    translate.value = { x: 0, y: 0 }
    
    // 预加载图片
    const img = new Image()
    img.onload = () => {
      loading.value = false
    }
    img.src = newValue
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 