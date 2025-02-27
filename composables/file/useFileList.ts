import { ref, watch } from 'vue'
import type { FileItem } from '~/types/file'

export const useFileList = () => {
  const currentPath = ref('/')
  const files = ref<FileItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { listFiles } = useAlistApi()

  const loadFiles = async () => {
    try {
      loading.value = true
      error.value = null
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
    } finally {
      loading.value = false
    }
  }

  const navigateBack = async () => {
    if (currentPath.value === '/') return
    const segments = currentPath.value.split('/').filter(Boolean)
    segments.pop()
    currentPath.value = segments.length ? '/' + segments.join('/') : '/'
    await loadFiles()
  }

  const navigateTo = async (path: string) => {
    currentPath.value = path
    await loadFiles()
  }

  const pathSegments = computed(() => {
    return currentPath.value.split('/').filter(Boolean)
  })

  const getPathUpTo = (index: number) => {
    return '/' + pathSegments.value.slice(0, index + 1).join('/')
  }

  // 保存当前路径到 localStorage
  const saveCurrentPath = () => {
    localStorage.setItem('alist-last-path', currentPath.value)
  }

  // 监听路径变化
  watch(currentPath, () => {
    saveCurrentPath()
  })

  // 初始化时加载上次路径
  onMounted(() => {
    const lastPath = localStorage.getItem('alist-last-path')
    if (lastPath) {
      currentPath.value = lastPath
    }
    // 加载文件列表
    loadFiles()
  })

  return {
    currentPath,
    files,
    loading,
    error,
    loadFiles,
    navigateBack,
    navigateTo,
    pathSegments,
    getPathUpTo
  }
} 