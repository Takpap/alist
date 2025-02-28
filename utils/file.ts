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