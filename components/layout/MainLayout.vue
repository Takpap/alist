<!-- components/layout/MainLayout.vue -->
<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">AList</h1>
        <button
          @click="goToConfig"
          class="px-3 py-1 text-sm border rounded hover:bg-gray-100"
        >
          Settings
        </button>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const { isEditing } = useAlistConfig()
const { navigateTo } = useRouter()

const goToConfig = () => {
  isEditing.value = true
  return navigateTo('/', { replace: true })
}
</script> 