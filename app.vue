<template>
  <div>
    <NuxtErrorBoundary>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
      <template #error="{ error }">
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-red-600">
            {{ error }}
          </div>
        </div>
      </template>
    </NuxtErrorBoundary>
  </div>
</template>

<script setup lang="ts">
// 确保应用已经挂载
const nuxtApp = useNuxtApp()

console.log('App 初始化')

onMounted(() => {
  console.log('App 已挂载')
})
</script>
