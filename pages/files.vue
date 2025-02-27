<template>
  <div class="min-h-screen flex flex-col p-4">
    <!-- 顶部导航栏 -->
    <div class="flex flex-col space-y-2 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <button
            @click="navigateBack"
            class="px-3 py-1 text-sm border rounded hover:bg-gray-100"
            :disabled="currentPath === '/'"
          >
            返回上级
          </button>
          <button
            @click="goToConfig"
            class="px-3 py-1 text-sm border rounded hover:bg-gray-100"
          >
            修改配置
          </button>
        </div>
        <div class="flex items-center space-x-2">
          <div v-if="layout === 'grid'" class="flex items-center space-x-2 mr-4">
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              v-model.number="gridColumns"
              class="w-24 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            >
            <span class="text-sm text-gray-500">{{ gridColumns }} 列</span>
          </div>
          <button
            @click="layout = 'grid'"
            class="p-1.5 rounded hover:bg-gray-100"
            :class="{ 'bg-gray-100': layout === 'grid' }"
            title="网格视图"
          >
            <Icon name="ph:grid-four" class="h-4 w-4" />
          </button>
          <button
            @click="layout = 'list'"
            class="p-1.5 rounded hover:bg-gray-100"
            :class="{ 'bg-gray-100': layout === 'list' }"
            title="列表视图"
          >
            <Icon name="ph:list" class="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <!-- 路径导航 -->
      <div class="flex items-center space-x-1 text-sm overflow-x-auto">
        <button
          @click="navigateTo('/')"
          class="px-2 py-1 hover:bg-gray-100 rounded"
        >
          根目录
        </button>
        <template v-for="(segment, index) in pathSegments" :key="index">
          <span class="text-gray-400">/</span>
          <button
            @click="navigateTo(getPathUpTo(index))"
            class="px-2 py-1 hover:bg-gray-100 rounded truncate max-w-[200px]"
          >
            {{ segment }}
          </button>
        </template>
      </div>
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
      <div ref="container" class="h-full overflow-auto">
        <div v-if="files.length === 0" class="flex items-center justify-center h-full text-gray-600">
          文件夹为空
        </div>
        <!-- 网格视图 -->
        <div 
          v-else-if="layout === 'grid'" 
          class="grid gap-4"
          :class="{
            'grid-cols-2': gridColumns === 2,
            'grid-cols-3': gridColumns === 3,
            'grid-cols-4': gridColumns === 4,
            'grid-cols-5': gridColumns === 5,
            'grid-cols-6': gridColumns === 6,
            'grid-cols-7': gridColumns === 7,
            'grid-cols-8': gridColumns === 8,
            'grid-cols-9': gridColumns === 9,
            'grid-cols-10': gridColumns === 10,
            'grid-cols-11': gridColumns === 11,
            'grid-cols-12': gridColumns === 12,
            'grid-cols-13': gridColumns === 13,
            'grid-cols-14': gridColumns === 14,
            'grid-cols-15': gridColumns === 15,
            'grid-cols-16': gridColumns === 16
          }"
        >
          <div
            v-for="file in files"
            :key="file.name"
            @click="handleFileClick(file)"
            class="p-2 border rounded-lg hover:bg-gray-50 cursor-pointer flex flex-col"
          >
            <!-- 预览区域 -->
            <div class="flex justify-center mb-2">
              <!-- 文件夹图标 -->
              <div v-if="file.is_dir" class="text-yellow-500 w-20 h-20 flex items-center justify-center">
                <Icon name="ph:folder" class="h-12 w-12" />
              </div>
              <!-- 图片预览 -->
              <div v-else-if="isImage(file)" class="w-20 h-20 flex-shrink-0">
                <ClientOnly>
                  <AsyncImage
                    :file="file"
                    :current-path="currentPath"
                    class="w-full h-full object-cover rounded"
                    @error="handleImageError"
                  />
                </ClientOnly>
              </div>
              <!-- 视频预览 -->
              <div v-else-if="isVideo(file)" class="w-20 h-20 flex-shrink-0 relative">
                <ClientOnly>
                  <AsyncVideo
                    :file="file"
                    :current-path="currentPath"
                    class="w-full h-full object-cover rounded"
                  />
                </ClientOnly>
                <div class="absolute inset-0 flex items-center justify-center hover:bg-black hover:bg-opacity-30 rounded transition-all duration-200">
                  <div class="rounded-full">
                    <Icon name="ph:play-fill" class="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
              <!-- 其他文件图标 -->
              <div v-else class="text-blue-500 w-20 h-20 flex items-center justify-center">
                <Icon name="ph:file-text" class="h-12 w-12" />
              </div>
            </div>
            
            <!-- 文件信息 -->
            <div class="min-w-0 px-1">
              <div class="text-sm truncate">{{ file.name }}</div>
              <div class="text-xs text-gray-500">
                {{ file.is_dir ? '文件夹' : formatFileSize(file.size) }}
              </div>
            </div>
          </div>
        </div>
        <!-- 列表视图 -->
        <div v-else class="divide-y">
          <div
            v-for="file in files"
            :key="file.name"
            @click="handleFileClick(file)"
            class="flex items-center space-x-4 px-4 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <!-- 文件夹图标 -->
            <div v-if="file.is_dir" class="text-yellow-500">
              <Icon name="ph:folder" class="h-5 w-5" />
            </div>
            <!-- 图片预览 -->
            <div v-else-if="isImage(file)" class="w-12 h-12 flex-shrink-0">
              <ClientOnly>
                <AsyncImage
                  :file="file"
                  :current-path="currentPath"
                  class="w-full h-full object-cover rounded"
                  @error="handleImageError"
                />
              </ClientOnly>
            </div>
            <!-- 视频预览 -->
            <div v-else-if="isVideo(file)" class="w-12 h-12 flex-shrink-0 relative">
              <ClientOnly>
                <AsyncVideo
                  :file="file"
                  :current-path="currentPath"
                  class="w-full h-full object-cover rounded"
                />
              </ClientOnly>
              <div class="absolute inset-0 flex items-center justify-center hover:bg-black hover:bg-opacity-30 rounded transition-all duration-200">
                <div class="rounded-full">
                  <Icon name="ph:play-fill" class="w-4 h-4 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            <!-- 其他文件图标 -->
            <div v-else class="text-blue-500">
              <Icon name="ph:file-text" class="h-5 w-5" />
            </div>
            
            <div class="flex-1 min-w-0 flex items-center justify-between">
              <div class="truncate">{{ file.name }}</div>
              <div class="text-sm text-gray-500 ml-4">
                {{ file.is_dir ? '文件夹' : formatFileSize(file.size) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <ClientOnly>
      <vue-easy-lightbox
        :visible="!!previewImage"
        :imgs="previewImage ? [previewImage] : []"
        :index="0"
        @hide="closePreview"
        :moveDisabled="true"
        :rotateDisabled="true"
        :teleport="'body'"
      >
        <template #loading>
          <div class="text-gray-400">加载中...</div>
        </template>
        <template #error>
          <div class="text-red-400">加载失败</div>
        </template>
      </vue-easy-lightbox>
    </ClientOnly>

    <!-- 视频预览 -->
    <ClientOnly>
      <div v-if="previewVideo" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div class="relative w-full max-w-4xl mx-auto px-4">
          <button
            @click="closePreview"
            class="absolute top-4 right-4 text-white hover:text-gray-300 z-60"
          >
            <Icon name="ph:x" class="h-6 w-6" />
          </button>
          <div ref="videoPlayer" class="w-full aspect-video bg-black rounded overflow-hidden"></div>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import VueEasyLightbox from 'vue-easy-lightbox'
import { useVirtualList } from '@vueuse/core'
import { defineComponent, h, ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import type { PropType } from 'vue'
import { useRouter, useRoute, navigateTo } from '#app'

interface FileItem {
  name: string
  size: number
  is_dir: boolean
  modified: string
  sign?: string
  thumb?: string
  type: number
  raw_url?: string
}

const { baseUrl, isConfigured, isEditing } = useAlistConfig()
const { listFiles, getDownloadUrl, loading, error } = useAlistApi()
const router = useRouter()
const currentPath = ref('/')
const files = ref<FileItem[]>([])
const previewImage = ref<string | null>(null)
const previewVideo = ref<string | null>(null)
const videoPlayer = ref<HTMLElement | null>(null)
const container = ref<HTMLElement | null>(null)
let player: any = null
const layout = ref<'grid' | 'list'>('grid')
const gridColumns = ref<number>(3)

console.log('组件初始化', {
  baseUrl: baseUrl.value,
  isConfigured: isConfigured.value,
  isEditing: isEditing.value
})

// 虚拟滚动优化
const { list: displayedFiles } = useVirtualList(files, {
  itemHeight: 80,
  overscan: 10,
})

// 在模板中使用的计算属性
const displayedFileItems = computed(() => displayedFiles.value.map(item => item.data))

// 计算路径段
const pathSegments = computed(() => {
  return currentPath.value.split('/').filter(Boolean)
})

// 获取到指定索引的路径
const getPathUpTo = (index: number) => {
  return '/' + pathSegments.value.slice(0, index + 1).join('/')
}

// 导航到指定路径
const navigateTo = async (path: string) => {
  currentPath.value = path
  await loadFiles()
}

// 加载文件列表
const loadFiles = async () => {
  try {
    console.log('开始加载文件列表，路径：', currentPath.value)
    const result = await listFiles(currentPath.value)
    console.log('文件列表结果：', result)
    
    if (result && result.content) {
      files.value = result.content
      console.log('更新文件列表：', files.value.length, '个文件')
    } else {
      console.warn('文件列表为空')
      files.value = []
    }
  } catch (e) {
    console.error('加载文件列表失败：', e)
    error.value = '加载文件列表失败'
  }
}

// 文件类型判断
const isImage = (file: FileItem) => {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  return !file.is_dir && imageExts.some(ext => file.name.toLowerCase().endsWith(ext))
}

const isVideo = (file: FileItem) => {
  const videoExts = ['.mp4', '.webm', '.ogg', '.m4v', '.mov']
  return !file.is_dir && videoExts.some(ext => file.name.toLowerCase().endsWith(ext))
}

// 获取预览URL
const getPreviewUrl = async (file: FileItem) => {
  if (isVideo(file)) {
    console.log('获取视频下载链接：', `${currentPath.value}/${file.name}`)
    const url = await getDownloadUrl(`${currentPath.value}/${file.name}`)
    return convertToProxyUrl(url)
  }

  if (file.raw_url) {
    console.log('使用原始URL：', file.raw_url)
    return file.raw_url
  }

  if (file.thumb) {
    console.log('使用缩略图：', file.thumb)
    return file.thumb
  }

  if (isImage(file)) {
    console.log('获取图片下载链接：', `${currentPath.value}/${file.name}`)
    return await getDownloadUrl(`${currentPath.value}/${file.name}`)
  }

  return ''
}

// 转换为代理URL
const convertToProxyUrl = (url: string) => {
  try {
    const originalUrl = new URL(url)
    // 保持完整的路径和查询参数
    return `/proxy${originalUrl.pathname}${originalUrl.search}${originalUrl.hash}`
  } catch (e) {
    console.error('URL转换失败：', e)
    return url
  }
}

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
}

// 处理文件点击
const handleFileClick = async (file: FileItem) => {
  try {
    console.log('点击文件：', file)
    if (file.is_dir) {
      currentPath.value = currentPath.value === '/' 
        ? `/${file.name}`
        : `${currentPath.value}/${file.name}`
      await loadFiles()
    } else if (isImage(file)) {
      console.log('预览图片：', file.name)
      const url = await getPreviewUrl(file)
      console.log('图片预览 URL：', url)
      if (url) {
        previewImage.value = url
      }
    } else if (isVideo(file)) {
      console.log('预览视频：', file.name)
      const url = await getPreviewUrl(file)
      console.log('视频预览 URL：', url)
      if (url) {
        previewVideo.value = url
        await nextTick()
        if (videoPlayer.value) {
          await initVideoPlayer()
        }
      }
    } else {
      const url = await getPreviewUrl(file)
      console.log('文件下载 URL：', url)
      if (url) {
        window.open(url, '_blank')
      }
    }
  } catch (e) {
    console.error('处理文件点击失败：', e)
    error.value = '处理文件失败'
  }
}

// 返回上级目录
const navigateBack = async () => {
  if (currentPath.value === '/') return
  const segments = currentPath.value.split('/').filter(Boolean)
  segments.pop()
  currentPath.value = segments.length ? '/' + segments.join('/') : '/'
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

// 关闭预览
const closePreview = () => {
  previewImage.value = null
  previewVideo.value = null
  if (player) {
    player.destroy()
    player = null
  }
}

// 视频预览组件
const initVideoPlayer = async () => {
  if (!process.client || !videoPlayer.value || !previewVideo.value) {
    console.log('视频播放器初始化条件不满足：', {
      isClient: process.client,
      hasVideoPlayer: !!videoPlayer.value,
      hasPreviewVideo: !!previewVideo.value
    })
    return
  }

  try {
    console.log('开始初始化视频播放器')
    // 动态导入 Plyr
    const [{ default: Plyr }, _] = await Promise.all([
      import('plyr'),
      import('plyr/dist/plyr.css')
    ])

    if (player) {
      console.log('销毁旧的播放器')
      player.destroy()
      player = null
    }

    const video = document.createElement('video')
    video.src = previewVideo.value
    video.controls = true
    video.crossOrigin = 'anonymous'
    videoPlayer.value.innerHTML = ''
    videoPlayer.value.appendChild(video)
    
    player = new Plyr(video, {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
    })

    console.log('视频播放器初始化完成')
  } catch (e) {
    console.error('加载视频播放器失败：', e)
  }
}

// 保存当前路径到 localStorage
const saveCurrentPath = () => {
  localStorage.setItem('alist-last-path', currentPath.value)
}

// 监听路径变化
watch(currentPath, () => {
  saveCurrentPath()
})

// 保存布局到 localStorage
const saveLayout = () => {
  localStorage.setItem('alist-layout', layout.value)
  if (layout.value === 'grid') {
    localStorage.setItem('alist-grid-columns', gridColumns.value.toString())
  }
}

// 监听布局变化
watch(layout, () => {
  saveLayout()
})

// 监听列数变化
watch(gridColumns, () => {
  if (layout.value === 'grid') {
    localStorage.setItem('alist-grid-columns', gridColumns.value.toString())
  }
})

// 组件挂载时加载上次路径和布局
onMounted(async () => {
  const lastPath = localStorage.getItem('alist-last-path')
  if (lastPath) {
    currentPath.value = lastPath
  }
  const savedLayout = localStorage.getItem('alist-layout')
  if (savedLayout === 'grid' || savedLayout === 'list') {
    layout.value = savedLayout
  }
  if (layout.value === 'grid') {
    const savedGridColumns = localStorage.getItem('alist-grid-columns')
    if (savedGridColumns) {
      const columns = parseInt(savedGridColumns)
      if (columns >= 2 && columns <= 16) {
        gridColumns.value = columns
      }
    }
  }
  try {
    console.log('组件挂载，检查配置状态：', {
      baseUrl: baseUrl.value,
      isConfigured: isConfigured.value,
      isEditing: isEditing.value,
      loading: loading.value,
      error: error.value
    })
    
    if (!isConfigured.value) {
      console.log('未配置，重定向到首页')
      await navigateTo('/', { replace: true })
      return
    }
    
    console.log('开始加载文件列表')
    await loadFiles()
    console.log('文件列表加载完成')
  } catch (e) {
    console.error('组件挂载失败：', e)
    error.value = '加载失败'
  }
})

// 组件卸载时清理
onUnmounted(() => {
  if (player) {
    player.destroy()
    player = null
  }
})

// 异步图片组件
const AsyncImage = defineComponent({
  props: {
    file: {
      type: Object as PropType<FileItem>,
      required: true
    },
    currentPath: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const url = ref('')
    const { getDownloadUrl } = useAlistApi()
    const loading = ref(true)
    const error = ref(false)

    onMounted(async () => {
      try {
        if (props.file.thumb) {
          url.value = props.file.thumb
        } else {
          console.log('获取下载链接：', `${props.currentPath}/${props.file.name}`)
          const downloadUrl = await getDownloadUrl(`${props.currentPath}/${props.file.name}`)
          if (downloadUrl) {
            url.value = downloadUrl
          }
        }
      } catch (e) {
        console.error('加载图片失败：', e)
        error.value = true
      } finally {
        loading.value = false
      }
    })

    return () => h('div', { class: 'relative w-full h-full' }, [
      loading.value && h('div', { class: 'absolute inset-0 flex items-center justify-center bg-gray-100 rounded' }, [
        h('div', { class: 'text-gray-400 text-sm' }, '加载中...')
      ]),
      error.value && h('div', { class: 'absolute inset-0 flex items-center justify-center bg-gray-100 rounded' }, [
        h('div', { class: 'text-red-400 text-sm' }, '加载失败')
      ]),
      h('img', {
        src: url.value || '',
        class: 'w-full h-full object-cover rounded',
        style: {
          opacity: loading.value || error.value ? 0 : 1
        },
        loading: 'lazy',
        onLoad: () => {
          loading.value = false
        },
        onError: () => {
          loading.value = false
          error.value = true
        }
      }),
      !url.value && !loading.value && !error.value && h(resolveComponent('Icon'), {
        name: 'ph:image',
        class: 'w-full h-full text-gray-400'
      })
    ])
  }
})

// 异步视频组件
const AsyncVideo = defineComponent({
  props: {
    file: {
      type: Object as PropType<FileItem>,
      required: true
    },
    currentPath: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const url = ref('')
    const loading = ref(true)
    const error = ref(false)

    onMounted(() => {
      try {
        console.log('视频文件信息：', props.file)
        // 使用 raw_url 或 thumb
        if (props.file.raw_url) {
          url.value = props.file.raw_url
          console.log('使用视频 raw_url：', url.value)
        } else if (props.file.thumb) {
          url.value = props.file.thumb
          console.log('使用视频 thumb：', url.value)
        } else {
          console.warn('视频没有预览图')
          error.value = true
        }
      } catch (e) {
        console.error('加载视频缩略图失败：', e)
        error.value = true
      } finally {
        loading.value = false
      }
    })

    return () => h('div', { class: 'relative w-full h-full' }, [
      loading.value && h('div', { class: 'absolute inset-0 flex items-center justify-center bg-gray-100 rounded' }, [
        h('div', { class: 'text-gray-400 text-sm' }, '加载中...')
      ]),
      error.value && h('div', { class: 'absolute inset-0 flex items-center justify-center bg-gray-100 rounded' }, [
        h('div', { class: 'text-red-400 text-sm' }, '无预览图')
      ]),
      !error.value && h('img', {
        src: url.value || '',
        class: 'w-full h-full object-cover rounded',
        style: {
          opacity: loading.value ? 0 : 1
        },
        loading: 'lazy',
        onLoad: () => {
          loading.value = false
          error.value = false
        },
        onError: () => {
          loading.value = false
          error.value = true
          console.error('视频预览图加载失败：', url.value)
        }
      }),
      !url.value && !loading.value && !error.value && h(resolveComponent('Icon'), {
        name: 'ph:video-camera',
        class: 'w-full h-full text-gray-400'
      })
    ])
  }
})

// 客户端专用组件
const ClientOnly = defineComponent({
  setup(_, { slots }) {
    const isMounted = ref(false)
    onMounted(() => {
      isMounted.value = true
    })
    return () => isMounted.value && slots.default ? slots.default() : null
  }
})
</script> 