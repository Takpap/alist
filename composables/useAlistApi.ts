interface AlistResponse<T> {
  code: number
  message: string
  data: T
}

interface FileInfo {
  name: string
  size: number
  is_dir: boolean
  modified: string
  sign?: string
  thumb?: string
  type: number
}

interface FsListResponse {
  content: FileInfo[]
  total: number
  readme: string
  write: boolean
  provider: string
}

export const useAlistApi = () => {
  const { baseUrl, token } = useAlistConfig()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const headers = computed(() => ({
    'Authorization': token.value ? `Bearer ${token.value}` : '',
  }))

  const listFiles = async (path: string = '/') => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<AlistResponse<FsListResponse>>(`${baseUrl.value}/api/fs/list`, {
        method: 'POST',
        headers: headers.value,
        body: {
          path,
          password: '',
          page: 1,
          per_page: 100,
          refresh: false,
        },
      })

      if (response.code !== 200) {
        throw new Error(response.message)
      }

      return response.data
    } catch (e: any) {
      error.value = e.message || '获取文件列表失败'
      return null
    } finally {
      loading.value = false
    }
  }

  const getDownloadUrl = async (path: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await $fetch<AlistResponse<{ url: string }>>(`${baseUrl.value}/api/fs/get`, {
        method: 'POST',
        headers: headers.value,
        body: {
          path,
          password: '',
        },
      })

      if (response.code !== 200) {
        throw new Error(response.message)
      }

      return response.data.url
    } catch (e: any) {
      error.value = e.message || '获取下载链接失败'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    listFiles,
    getDownloadUrl,
    loading,
    error,
  }
} 