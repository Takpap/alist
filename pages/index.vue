<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="text-center text-3xl font-bold">Alist 客户端</h2>
        <p class="mt-2 text-center text-gray-600">请输入您的 Alist 站点地址</p>
      </div>
      
      <div class="mt-8 space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">站点地址</label>
          <input
            v-model="baseUrl"
            type="text"
            placeholder="https://your-alist-site.com"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">访问令牌（可选）</label>
          <input
            v-model="token"
            type="password"
            placeholder="输入访问令牌"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div class="flex justify-between">
          <button
            @click="saveConfig"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>

    <div v-if="error" class="mt-4 text-red-600">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl, token, isEditing } = useAlistConfig()
const error = ref('')

const saveConfig = async () => {
  error.value = ''
  
  if (!baseUrl.value) {
    error.value = '请输入站点地址'
    return
  }

  // 移除结尾的斜杠
  baseUrl.value = baseUrl.value.replace(/\/$/, '')
  
  try {
    // 验证站点是否可访问
    const response = await $fetch(`${baseUrl.value}/api/fs/list`, {
      method: 'POST',
      body: {
        path: '/',
        password: '',
        page: 1,
        per_page: 1,
      }
    })
    
    // 重置编辑模式并跳转
    isEditing.value = false
    return navigateTo('/files', { replace: true })
  } catch (e) {
    error.value = '无法连接到 Alist 站点，请检查地址是否正确'
  }
}

// 如果已配置且不是编辑模式，直接跳转到文件列表
onMounted(async () => {
  if (baseUrl.value && !isEditing.value) {
    await navigateTo('/files', { replace: true })
  }
})
</script> 