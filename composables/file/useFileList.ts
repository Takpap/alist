import { ref, watch } from 'vue'
import type { FileItem } from '~/types/file'

interface CacheItem {
  files: FileItem[]
  page: number
  total: number
  scrollTop: number
  lastAccessed: number
}

class LRUCache {
  private cache: Map<string, CacheItem>
  private maxSize: number

  constructor(maxSize: number) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  get(key: string): CacheItem | undefined {
    const item = this.cache.get(key)
    if (item) {
      // 更新访问时间
      item.lastAccessed = Date.now()
      // 删除并重新添加到 Map 末尾，保持 LRU 顺序
      this.cache.delete(key)
      this.cache.set(key, item)
    }
    return item
  }

  set(key: string, value: Omit<CacheItem, 'lastAccessed'>): void {
    // 如果缓存已满，删除最久未使用的项
    if (this.cache.size >= this.maxSize) {
      let oldestKey = this.cache.keys().next().value
      let oldestTime = Infinity
      
      // 找到最久未使用的项
      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed
          oldestKey = k
        }
      }
      
      this.cache.delete(oldestKey)
    }
    
    // 添加新项
    this.cache.set(key, {
      ...value,
      lastAccessed: Date.now()
    })
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const useFileList = () => {
  const currentPath = ref('/')
  const files = ref<FileItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const page = ref(1)
  const perPage = ref(100)
  const hasMore = ref(false)
  const total = ref(0)
  
  // 缓存系统 - 最多缓存 20 个目录
  const cache = new LRUCache(20)

  const { listFiles } = useAlistApi()

  const loadFiles = async (isLoadMore = false) => {
    try {
      loading.value = true
      error.value = null

      // 如果不是加载更多且有缓存，使用缓存
      if (!isLoadMore && cache.has(currentPath.value)) {
        const cached = cache.get(currentPath.value)!
        files.value = cached.files
        page.value = cached.page
        total.value = cached.total
        hasMore.value = files.value.length < total.value
        
        // 在下一个 tick 恢复滚动位置
        await nextTick()
        window.scrollTo(0, cached.scrollTop)
        return
      }

      console.log('开始加载文件列表，路径：', currentPath.value, '页码：', page.value)
      const result = await listFiles(currentPath.value, page.value, perPage.value)
      console.log('文件列表结果：', result)
      
      if (result && result.content) {
        if (isLoadMore) {
          files.value = [...files.value, ...result.content]
        } else {
          files.value = result.content
        }
        total.value = result.total
        hasMore.value = files.value.length < total.value
        console.log('更新文件列表：', files.value.length, '个文件，总共：', total.value)

        // 更新缓存
        cache.set(currentPath.value, {
          files: files.value,
          page: page.value,
          total: total.value,
          scrollTop: window.scrollY
        })
      } else {
        console.warn('文件列表为空')
        if (!isLoadMore) {
          files.value = []
          total.value = 0
          hasMore.value = false
          cache.delete(currentPath.value)
        }
      }
    } catch (e) {
      console.error('加载文件列表失败：', e)
      error.value = '加载文件列表失败'
    } finally {
      loading.value = false
    }
  }

  const loadMore = async () => {
    if (loading.value || !hasMore.value) return
    page.value++
    await loadFiles(true)
  }

  const navigateBack = async () => {
    if (currentPath.value === '/') return
    const segments = currentPath.value.split('/').filter(Boolean)
    segments.pop()
    currentPath.value = segments.length ? '/' + segments.join('/') : '/'
    page.value = 1
    await loadFiles()
  }

  const navigateTo = async (path: string) => {
    // 保存当前页面的滚动位置
    if (cache.has(currentPath.value)) {
      const cached = cache.get(currentPath.value)!
      cache.set(currentPath.value, {
        files: cached.files,
        page: cached.page,
        total: cached.total,
        scrollTop: window.scrollY
      })
    }

    currentPath.value = path
    page.value = 1
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

  // 页面卸载时清理缓存
  onUnmounted(() => {
    cache.clear()
  })

  return {
    currentPath,
    files,
    loading,
    error,
    hasMore,
    total,
    loadFiles,
    loadMore,
    navigateBack,
    navigateTo,
    pathSegments,
    getPathUpTo
  }
} 