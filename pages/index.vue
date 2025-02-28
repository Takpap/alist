<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4">
    <div class="max-w-2xl w-full space-y-8">
      <div>
        <h2 class="text-center text-3xl font-bold">Alist 客户端</h2>
        <p class="mt-2 text-center text-gray-600">管理您的 Alist 站点</p>
      </div>
      
      <!-- 站点列表 -->
      <div v-if="config.sites.length > 0" class="bg-white shadow rounded-lg divide-y">
        <div
          v-for="site in config.sites"
          :key="site.id"
          class="p-4 flex items-center justify-between hover:bg-gray-50"
          :class="{ 'bg-blue-50': site.id === config.currentSiteId }"
        >
          <div class="flex-1 min-w-0 mr-4">
            <div class="flex items-center">
              <h3 class="text-lg font-medium text-gray-900">{{ site.name }}</h3>
              <span
                v-if="site.id === config.currentSiteId"
                class="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                当前
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-500 truncate">{{ site.url }}</p>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              v-if="site.id !== config.currentSiteId"
              @click="switchAndGo(site.id)"
              class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              切换
            </button>
            <button
              @click="editSite(site)"
              class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              编辑
            </button>
            <button
              @click="removeSite(site.id)"
              class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 添加/编辑站点表单 -->
      <div class="bg-white shadow rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ editingSite ? '编辑站点' : '添加新站点' }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">站点名称</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="给这个站点起个名字"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">站点地址</label>
            <input
              v-model="form.url"
              type="text"
              placeholder="https://your-alist-site.com"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">访问令牌（可选）</label>
            <input
              v-model="form.token"
              type="password"
              placeholder="输入访问令牌"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div class="flex justify-between pt-4">
            <button
              v-if="editingSite"
              @click="cancelEdit"
              class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
            >
              取消
            </button>
            <button
              @click="saveSite"
              class="flex-1 ml-3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              :class="{ 'ml-0': !editingSite }"
            >
              {{ editingSite ? '保存修改' : '添加站点' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="mt-4 text-sm text-red-600">{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SiteConfig } from '~/types/file'

const {
  config,
  isEditing,
  addSite,
  updateSite,
  deleteSite,
  switchSite
} = useAlistConfig()

const error = ref('')
const editingSite = ref<string | null>(null)
const form = ref({
  name: '',
  url: '',
  token: ''
})

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    url: '',
    token: ''
  }
  editingSite.value = null
}

// 编辑站点
const editSite = (site: SiteConfig) => {
  form.value = {
    name: site.name,
    url: site.url,
    token: site.token || ''
  }
  editingSite.value = site.id
}

// 取消编辑
const cancelEdit = () => {
  resetForm()
}

// 删除站点
const removeSite = async (id: string) => {
  if (confirm('确定要删除这个站点吗？')) {
    deleteSite(id)
  }
}

// 切换站点并跳转
const switchAndGo = async (id: string) => {
  switchSite(id)
  isEditing.value = false
  return navigateTo('/files', { replace: true })
}

// 保存站点
const saveSite = async () => {
  error.value = ''

  if (!form.value.url.trim()) {
    error.value = '请输入站点地址'
    return
  }

  // 移除结尾的斜杠
  form.value.url = form.value.url.replace(/\/$/, '')
  
  try {
    // 验证站点是否可访问
    const response = await $fetch(`${form.value.url}/api/fs/list`, {
      method: 'POST',
      body: {
        path: '/',
        password: '',
        page: 1,
        per_page: 1,
      }
    })

    // 如果没有输入名称，使用 URL 的 hostname 作为默认名称
    let siteName = form.value.name.trim()
    if (!siteName) {
      try {
        const url = new URL(form.value.url)
        siteName = url.hostname
      } catch (e) {
        error.value = '站点地址格式不正确'
        return
      }
    }
    
    if (editingSite.value) {
      // 更新现有站点
      updateSite(editingSite.value, {
        name: siteName,
        url: form.value.url,
        token: form.value.token
      })
    } else {
      // 添加新站点
      addSite({
        name: siteName,
        url: form.value.url,
        token: form.value.token
      })
    }
    
    resetForm()
    
    // 如果只有一个站点，自动跳转到文件列表
    if (config.value.sites.length === 1) {
      isEditing.value = false
      return navigateTo('/files', { replace: true })
    }
  } catch (e) {
    error.value = '无法连接到 Alist 站点，请检查地址是否正确'
  }
}

// 如果已配置且不是编辑模式，直接跳转到文件列表
onMounted(async () => {
  if (config.value.sites.length > 0 && !isEditing.value) {
    await navigateTo('/files', { replace: true })
  }
})
</script> 