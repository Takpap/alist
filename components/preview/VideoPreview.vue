<!-- components/preview/VideoPreview.vue -->
<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
    <div class="relative max-w-[90vw] max-h-[90vh]">
      <div ref="videoPlayerRef" class="w-full h-full"></div>
      <button
        class="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
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

defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const videoPlayerRef = ref<HTMLElement | null>(null)

watch(() => videoPlayerRef.value, (el) => {
  if (el) {
    nextTick(() => {
      // Initialize video player
    })
  }
}, { immediate: true })</script> 