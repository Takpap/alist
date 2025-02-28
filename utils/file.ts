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

// 处理 HEIC 图片转换
export const convertHeicToJpeg = async (url: string) => {
  if (!process.client) return url

  try {
    console.log('Converting HEIC image...')
    // 动态导入 heic2any
    const { default: heic2any } = await import('heic2any')
    
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
    
    // 转换为 JPEG
    const jpegBlob = await heic2any({
      blob,
      toType: 'image/jpeg',
      quality: 0.8
    }) as Blob
    
    console.log('HEIC conversion successful, new size:', jpegBlob.size)
    
    // 创建预览 URL
    const previewUrl = URL.createObjectURL(jpegBlob)
    
    // 在组件卸载时清理 URL
    onUnmounted(() => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    })
    
    return previewUrl
  } catch (error) {
    console.error('HEIC conversion failed:', error)
    // 转换失败时尝试使用代理 URL
    return convertToProxyUrl(url)
  }
}