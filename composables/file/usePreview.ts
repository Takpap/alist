import { ref, nextTick } from 'vue'
import type { FileItem } from '~/types/file'
import { isImage, isVideo, convertToProxyUrl } from '~/utils/file'

export const usePreview = () => {
  const previewVideo = ref<string | null>(null)
  const previewImage = ref<string | null>(null)
  const videoPlayer = ref<HTMLElement | null>(null)
  let player: any = null

  const { getDownloadUrl } = useAlistApi()

  const getPreviewUrl = async (file: FileItem, currentPath: string) => {
    // 优先使用 raw_url
    if (file.raw_url) {
      return file.raw_url
    }

    // 获取文件详情以获取 raw_url
    const url = await getDownloadUrl(`${currentPath}/${file.name}`)
    if (url) {
      if (isVideo(file)) {
        return convertToProxyUrl(url)
      }
      return url
    }

    // 如果都获取失败，使用缩略图
    if (file.thumb) {
      return file.thumb
    }

    return ''
  }

  const handleFileClick = async (file: FileItem, currentPath: string) => {
    try {
      console.log('点击文件：', file)
      if (file.is_dir) {
        return { type: 'directory' as const }
      } else if (isImage(file)) {
        console.log('预览图片：', file.name)
        const url = await getPreviewUrl(file, currentPath)
        console.log('图片预览 URL：', url)
        if (url) {
          previewImage.value = url
        }
        return { type: 'image' as const }
      } else if (isVideo(file)) {
        console.log('预览视频：', file.name)
        const url = await getPreviewUrl(file, currentPath)
        console.log('视频预览 URL：', url)
        if (url) {
          previewVideo.value = url
          await nextTick()
          if (videoPlayer.value) {
            await initVideoPlayer()
          }
        }
        return { type: 'video' as const }
      } else {
        const url = await getPreviewUrl(file, currentPath)
        console.log('文件下载 URL：', url)
        if (url) {
          window.open(url, '_blank')
        }
        return { type: 'file' as const }
      }
    } catch (e) {
      console.error('处理文件点击失败：', e)
      return { type: 'error' as const, error: '处理文件失败' }
    }
  }

  const closePreview = () => {
    previewImage.value = null
    previewVideo.value = null
    if (player) {
      player.destroy()
      player = null
    }
  }

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

  onUnmounted(() => {
    if (player) {
      player.destroy()
      player = null
    }
  })

  return {
    previewVideo,
    previewImage,
    videoPlayer,
    handleFileClick,
    closePreview
  }
} 