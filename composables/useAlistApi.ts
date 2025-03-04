import { convertHeicToJpeg } from '~/utils/file'

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
  name: any
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

  // 获取文件详情
  const getFileDetail = async (path: string): Promise<string | null> => {
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

      let url = response.data.raw_url || response.data.url


      // 如果是 HEIC 图片，转换为 JPG
      if (response.data.name.toLowerCase().endsWith('.heic')) {
        console.time('转换 HEIC 图片耗时...')
        url = await convertHeicToJpeg(url)
        console.timeEnd('转换 HEIC 图片耗时...')
      }

      return url
    } catch (e) {
      console.error('获取文件详情失败：', e)
      return null
    }
  }

  const listFiles = async (path: string = '/', page: number = 1, per_page: number = 100) => {
    loading.value = true
    error.value = null
    
    try {
      console.log('发送请求到：', `${baseUrl.value}/api/fs/list`, {
        headers: headers.value,
        body: {
          path,
          password: '',
          page,
          per_page,
          refresh: false,
        },
      })

      const response = await $fetch<AlistResponse<FsListResponse>>(`${baseUrl.value}/api/fs/list`, {
        method: 'POST',
        headers: headers.value,
        body: {
          path,
          password: '',
          page,
          per_page,
          refresh: false,
        },
      })

      console.log('API 响应：', response)

      if (response.code !== 200) {
        throw new Error(response.message)
      }

      // 处理图片文件
      if (response.data.content) {
        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
        const promises = response.data.content.map(async (file) => {
          // 如果是图片文件
          if (!file.is_dir && imageExts.some(ext => file.name.toLowerCase().endsWith(ext))) {
            // 如果没有缩略图和 raw_url，获取文件详情
            if (!file.thumb && !file.raw_url) {
              // const url = await getFileDetail(`${path}/${file.name}`)
              // if (url) {
              //   file.raw_url = url
              // }
              if (file.name.toLowerCase().endsWith('.heic')) {
                file.raw_url = await convertHeicToJpeg(`${baseUrl.value}/d${path}/${file.name}?sign=${file.sign}`)
              } else {
                file.raw_url = `/proxy/${baseUrl.value}/d${path}/${file.name}?sign=${file.sign}`
              }
            }
          }
          return file
        })
        response.data.content = await Promise.all(promises)
        console.log('处理后的文件列表：', response.data.content)
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