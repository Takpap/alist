import type { FileItem } from '~/types/file'

export const isImage = (file: FileItem) => {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
  return !file.is_dir && imageExts.some(ext => file.name.toLowerCase().endsWith(ext))
}

export const isVideo = (file: FileItem) => {
  const videoExts = ['.mp4', '.webm', '.ogg', '.m4v', '.mov']
  return !file.is_dir && videoExts.some(ext => file.name.toLowerCase().endsWith(ext))
}

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export const convertToProxyUrl = (url: string) => {
  try {
    // 获取域名作为代理的标识
    return `/proxy/${url}`
  } catch (e) {
    console.error('URL转换失败：', e)
    return url
  }
} 

// 缓存转换结果
const heicCache = new Map<string, string>()

// 处理 HEIC 图片转换
export const convertHeicToJpeg = async (url: string) => {
  // 确保只在客户端执行
  if (typeof window === 'undefined') {
    console.log('Running on server, skipping HEIC conversion')
    return url
  }

  try {
    // 检查缓存
    if (heicCache.has(url)) {
      return heicCache.get(url)!
    }

    console.log('Converting HEIC image...')
    
    // 使用代理 URL
    const proxyUrl = convertToProxyUrl(url)
    console.log('Using proxy URL for HEIC conversion:', proxyUrl)
    
    // 获取 HEIC 图片数据
    const response = await fetch(proxyUrl, {
      mode: 'cors',
      credentials: 'same-origin',
      headers: {
        'Accept': 'image/heic,image/heif,image/*'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch HEIC image: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    console.log('HEIC blob received, size:', blob.size)

    // 动态导入 heic2any
    const { default: heic2any } = await import('heic2any')

    // 使用 requestIdleCallback 在空闲时间处理转换
    const result = await new Promise<string>((resolve, reject) => {
      const processConversion = async () => {
        try {
          console.time('HEIC conversion')
          const jpegBlob = await heic2any({
            blob,
            toType: 'image/jpeg',
            quality: 0.3
          }) as Blob
          console.timeEnd('HEIC conversion')

          const previewUrl = URL.createObjectURL(jpegBlob)
          // 缓存结果
          heicCache.set(url, previewUrl)
          resolve(previewUrl)
        } catch (error) {
          reject(error)
        }
      }

      // 使用 requestIdleCallback 在浏览器空闲时执行转换
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          processConversion()
        }, { timeout: 5000 }) // 设置超时以确保最终会执行
      } else {
        // 降级为 setTimeout
        setTimeout(processConversion, 0)
      }
    })

    // 在组件卸载时清理 URL
    if (typeof onUnmounted === 'function') {
      onUnmounted(() => {
        if (result.startsWith('blob:')) {
          URL.revokeObjectURL(result)
          heicCache.delete(url)
        }
      })
    }

    return result
  } catch (error) {
    console.error('HEIC conversion failed:', error)
    // 转换失败时尝试使用代理 URL
    return convertToProxyUrl(url)
  }
}