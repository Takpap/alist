<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 py-6">
        <h2 class="text-2xl font-bold text-gray-900">Alist 站点管理</h2>
        <p class="mt-1 text-sm text-gray-500">管理您的所有 Alist 站点</p>
      </div>
    </header>

    <main class="flex-1 py-8">
      <div class="max-w-7xl mx-auto px-4">
        <!-- 搜索和操作栏 -->
        <div class="mb-6 flex items-center justify-between gap-4">
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索站点..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <button
            @click="showAddForm = true"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            添加站点
          </button>
        </div>

        <!-- 站点列表 -->
        <div v-if="filteredSites.length > 0" class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="site in paginatedSites"
            :key="site.id"
            class="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            @click="switchAndGo(site.id)"
          >
            <div class="p-4">
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center">
                    <h3 class="text-lg font-medium text-gray-900 truncate" :title="site.name">
                      {{ site.name }}
                    </h3>
                    <span
                      v-if="site.id === config.currentSiteId"
                      class="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full"
                    >
                      当前
                    </span>
                  </div>
                  <p class="mt-1 text-sm text-gray-500 truncate" :title="site.url">{{ site.url }}</p>
                </div>
                <div class="ml-4 relative site-menu">
                  <button
                    @click.stop="toggleSiteMenu(site.id)"
                    class="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  <!-- 站点操作菜单 -->
                  <div
                    v-if="activeSiteMenu === site.id"
                    class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
                    @click.stop
                  >
                    <div class="py-1">
                      <button
                        v-if="site.id !== config.currentSiteId"
                        @click="switchAndGo(site.id)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        切换到此站点
                      </button>
                      <button
                        @click="editSite(site)"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        编辑站点
                      </button>
                      <button
                        @click="removeSite(site.id)"
                        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        删除站点
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4 flex items-center text-sm text-gray-500">
                <span v-if="site.token" class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  已配置访问令牌
                </span>
              </div>
            </div>
            <div class="px-4 py-3 bg-gray-50 text-right rounded-b-lg">
              <button
                v-if="site.id !== config.currentSiteId"
                @click="switchAndGo(site.id)"
                class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                切换
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else
          class="text-center py-12 bg-white rounded-lg shadow"
        >
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ searchQuery ? '未找到匹配的站点' : '没有站点' }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ searchQuery ? '请尝试其他搜索关键词' : '开始添加您的第一个 Alist 站点' }}</p>
          <div class="mt-6">
            <button
              @click="showAddForm = true"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              添加站点
            </button>
          </div>
        </div>

        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="mt-6 flex justify-center">
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
            >
              <span class="sr-only">上一页</span>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              v-for="page in displayedPages"
              :key="page"
              @click="currentPage = page"
              :class="[
                page === currentPage
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
              ]"
            >
              {{ page }}
            </button>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
            >
              <span class="sr-only">下一页</span>
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </main>

    <!-- 添加/编辑站点对话框 -->
    <div
      v-if="showAddForm"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-medium text-gray-900">
            {{ editingSite ? '编辑站点' : '添加新站点' }}
          </h3>
        </div>
        
        <div class="px-6 py-4">
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
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
          <button
            @click="closeForm"
            class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            取消
          </button>
          <button
            @click="saveSite"
            class="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ editingSite ? '保存修改' : '添加站点' }}
          </button>
        </div>
      </div>
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
const showAddForm = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 9
const activeSiteMenu = ref<string | null>(null)

const form = ref({
  name: '',
  url: '',
  token: ''
})

// 搜索和过滤
const filteredSites = computed(() => {
  if (!searchQuery.value) return config.value.sites
  const query = searchQuery.value.toLowerCase()
  return config.value.sites.filter(site => 
    site.name.toLowerCase().includes(query) || 
    site.url.toLowerCase().includes(query)
  )
})

// 分页
const totalPages = computed(() => Math.ceil(filteredSites.value.length / itemsPerPage))

const paginatedSites = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSites.value.slice(start, end)
})

// 显示的页码范围
const displayedPages = computed(() => {
  const range = []
  const maxDisplayed = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxDisplayed / 2))
  let end = Math.min(totalPages.value, start + maxDisplayed - 1)
  
  if (end - start + 1 < maxDisplayed) {
    start = Math.max(1, end - maxDisplayed + 1)
  }
  
  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

// 监听搜索和过滤变化，重置页码
watch([searchQuery], () => {
  currentPage.value = 1
})

// 切换站点菜单
const toggleSiteMenu = (siteId: string) => {
  if (activeSiteMenu.value === siteId) {
    activeSiteMenu.value = null
  } else {
    activeSiteMenu.value = siteId
  }
}

// 点击其他地方关闭菜单
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (activeSiteMenu.value) {
      const target = e.target as HTMLElement
      if (!target.closest('.site-menu')) {
        activeSiteMenu.value = null
      }
    }
  })
})

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    url: '',
    token: ''
  }
  editingSite.value = null
  showAddForm.value = false
  error.value = ''
}

// 关闭表单
const closeForm = () => {
  resetForm()
}

// 编辑站点
const editSite = (site: SiteConfig) => {
  form.value = {
    name: site.name,
    url: site.url,
    token: site.token || ''
  }
  editingSite.value = site.id
  showAddForm.value = true
  activeSiteMenu.value = null
}

// 删除站点
const removeSite = async (id: string) => {
  if (confirm('确定要删除这个站点吗？')) {
    deleteSite(id)
    activeSiteMenu.value = null
  }
}

// 切换站点并跳转
const switchAndGo = async (id: string) => {
  switchSite(id)
  isEditing.value = false
  activeSiteMenu.value = null
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