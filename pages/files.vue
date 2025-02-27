<template>
  <div class="min-h-screen flex flex-col p-4">
    <!-- 顶部导航栏 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-2">
        <button
          @click="navigateBack"
          class="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          :disabled="currentPath === '/'"
        >
          返回上级
        </button>
        <div class="text-gray-600">当前路径: {{ currentPath }}</div>
      </div>
      <button
        @click="goToConfig"
        class="px-3 py-1 text-sm border rounded hover:bg-gray-100"
      >
        修改配置
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="text-gray-600">加载中...</div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-red-600">{{ error }}</div>
    </div>

    <!-- 文件列表 -->
    <div v-else class="flex-1">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="file in files"
          :key="file.name"
          @click="handleFileClick(file)"
          class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          <div class="flex items-center space-x-3">
            <!-- 文件夹图标 -->
            <div v-if="file.is_dir" class="text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <!-- 文件图标 -->
            <div v-else class="text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="truncate">{{ file.name }}</div>
              <div class="text-sm text-gray-500">
                {{ file.is_dir ? '文件夹' : formatFileSize(file.size) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { baseUrl, isConfigured, isEditing } = useAlistConfig()
const { listFiles, getDownloadUrl, loading, error } = useAlistApi()
const router = useRouter()
const currentPath = ref('/')
const files = ref<any[]>([])

// 如果未配置，重定向到首页
onMounted(async () => {
  if (!isConfigured.value) {
    await navigateTo('/', { replace: true })
    return
  }
  await loadFiles()
})

// 加载文件列表
const loadFiles = async () => {
  const result = await listFiles(currentPath.value)
  console.log('result', result)
  if (result) {
    files.value = result.content
  }
}

// 处理文件点击
const handleFileClick = async (file: any) => {
  if (file.is_dir) {
    currentPath.value = currentPath.value === '/' 
      ? `/${file.name}`
      : `${currentPath.value}/${file.name}`
    await loadFiles()
  } else {
    const url = await getDownloadUrl(`${currentPath.value}/${file.name}`)
    if (url) {
      window.open(url, '_blank')
    }
  }
}

// 返回上级目录
const navigateBack = async () => {
  if (currentPath.value === '/') return
  
  const parts = currentPath.value.split('/')
  parts.pop()
  currentPath.value = parts.join('/') || '/'
  await loadFiles()
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

const goToConfig = () => {
  isEditing.value = true
  return navigateTo('/', { replace: true })
}
</script> 