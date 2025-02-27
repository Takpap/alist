import { ref, nextTick } from 'vue'
import type { FileItem } from '~/types/file'
import { isImage, isVideo, convertToProxyUrl } from '~/utils/file'
import VideoPreview from '~/components/preview/VideoPreview.vue'

type VideoPlayerInstance = InstanceType<typeof VideoPreview>

const baseURL = process.client ? window.location.origin : ''

export const usePreview = () => {
  const previewVideo = ref<string | null>(null)
  const previewImage = ref<string | null>(null)
  const videoPlayer = ref<VideoPlayerInstance | null>(null)
  let player: any = null

  const { getDownloadUrl } = useAlistApi()

  // 处理 HEIC 图片转换
  const convertHeicToJpeg = async (url: string) => {
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
        quality: 1
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

  const getPreviewUrl = async (file: FileItem, currentPath: string) => {
    // 优先使用 raw_url
    if (file.raw_url) {
      return file.raw_url
    }

    // 获取文件详情以获取 raw_url
    const url = await getDownloadUrl(`${currentPath}/${file.name}`)
    if (url) {
      // 对于 HEIC/HEIF 文件，直接返回原始 URL，让 convertHeicToJpeg 处理
      if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        return url
      }
      // 对于其他文件，使用代理 URL
      return convertToProxyUrl(url)
    }

    // 如果都获取失败，使用缩略图
    if (file.thumb) {
      return convertToProxyUrl(file.thumb)
    }

    return ''
  }

  const handleFileClick = async (file: FileItem, currentPath: string) => {
    try {
      if (file.is_dir) {
        return { type: 'directory' as const }
      }

      if (isVideo(file)) {
        const url = await getPreviewUrl(file, currentPath)
        console.log('视频预览 URL：', url)
        if (url) {
          previewVideo.value = url
          await nextTick()
          await initVideoPlayer(url)
        }
        return { type: 'video' as const }
      }

      if (isImage(file)) {
        const url = await getPreviewUrl(file, currentPath)
        if (url) {
          // 检查是否是 HEIC 格式
          if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
            previewImage.value = await convertHeicToJpeg(url)
          } else {
            previewImage.value = url
          }
        }
        return { type: 'image' as const }
      }

      // 其他类型文件直接下载
      const url = await getPreviewUrl(file, currentPath)
      if (url) {
        window.open(url, '_blank')
      }
      return { type: 'other' as const }
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
    if (videoPlayer.value?.setRotateHandler) {
      videoPlayer.value.setRotateHandler(undefined)
    }
  }

  const initVideoPlayer = async (url: string) => {
    if (!process.client) return

    try {
      const container = videoPlayer.value?.videoContainer
      if (!container) {
        throw new Error('Video container not found')
      }

      // 清理现有内容
      container.innerHTML = ''

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

      // 创建 video 元素
      const video = document.createElement('video')
      video.className = 'plyr-video'
      video.playsInline = true
      video.controls = true

      // 创建 source 元素
      const source = document.createElement('source')
      source.src = url
      source.type = 'video/mp4'
      video.appendChild(source)

      // 添加到容器
      container.appendChild(video)
      
      // 初始化 Plyr
      player = new Plyr(video, {
        controls: [
          'play-large',
          'play',
          'progress',
          'current-time',
          'duration',
          'mute',
          'volume',
          'settings',
          'pip',
          'airplay',
          'fullscreen'
        ],
        settings: ['speed'],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        keyboard: { focused: true, global: true },
        tooltips: { controls: true, seek: true },
        ratio: '16:9'
      })

      // 添加旋转控制
      let currentRotation = 0
      const rotateVideo = (direction: 'left' | 'right') => {
        currentRotation = (currentRotation + (direction === 'left' ? -90 : 90)) % 360
        video.style.transform = `rotate(${currentRotation}deg)`
        // 根据旋转角度调整视频容器的宽高比
        if (currentRotation % 180 === 0) {
          container.style.aspectRatio = '16/9'
        } else {
          container.style.aspectRatio = '9/16'
        }
      }

      // 监听播放器事件
      player.on('ready', () => {
        console.log('播放器准备就绪')
        player.play()
      })

      player.on('error', (error: any) => {
        console.error('播放器错误：', error)
      })

      // 设置旋转处理函数
      if (videoPlayer.value?.setRotateHandler) {
        videoPlayer.value.setRotateHandler(rotateVideo)
      }

      console.log('视频播放器初始化完成')
    } catch (error) {
      console.error('加载视频播放器失败：', error)
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