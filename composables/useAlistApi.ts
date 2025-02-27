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
  raw_url?: string
}

interface FsListResponse {
  content: FileInfo[]
  total: number
  readme: string
  write: boolean
  provider: string
}

interface FsGetResponse {
  url: string
  raw_url?: string
}

export const useAlistApi = () => {
  const { baseUrl, token } = useAlistConfig()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const headers = computed(() => ({
    'Authorization': token.value ? `Bearer ${token.value}` : '',
    'Content-Type': 'application/json',
  }))

  const listFiles = async (path: string = '/') => {
    loading.value = true
    error.value = null
    
    try {
      console.log('发送请求到：', `${baseUrl.value}/api/fs/list`, {
        headers: headers.value,
        body: {
          path,
          password: '',
          page: 1,
          per_page: 100,
          refresh: false,
        },
      })

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

      console.log('API 响应：', response)

      if (response.code !== 200) {
        throw new Error(response.message)
      }

      return response.data
    } catch (e: any) {
      console.error('API 错误：', e)
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
      const response = await $fetch<AlistResponse<FsGetResponse>>(`${baseUrl.value}/api/fs/get`, {
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

      return response.data.raw_url || response.data.url
    } catch (e: any) {
      console.error('获取下载链接失败：', e)
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