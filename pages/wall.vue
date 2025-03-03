<template>
  <div class="waterfall-container" ref="container">
    <div 
      v-for="image in images" 
      :key="image.id"
      :style="image.style"
      class="image-item"
    >
      <div v-if="!image.loaded && !image.error" class="loading-placeholder">
        <div class="loading-spinner"></div>
      </div>
      <img
        :src="image.url"
        :alt="'Random image ' + image.id"
        @load="onImageLoad($event, image)"
        @error="onImageError(image)"
        :class="{ 'hidden': !image.loaded }"
      >
      <div v-if="image.error" class="error-placeholder">
        <span>图片加载失败</span>
      </div>
    </div>
    <div ref="observer" class="observer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const container = ref(null)
const observer = ref(null)
const images = ref([])
const columnCount = ref(3) // 设置默认列数
const columnHeights = ref([])

// 初始化列高度数组
const initColumnHeights = () => {
  if (process.client) {
    const count = Math.floor(window.innerWidth / 320)
    columnCount.value = count
    columnHeights.value = new Array(count).fill(0)
  } else {
    columnHeights.value = new Array(columnCount.value).fill(0)
  }
}

// 生成随机高度
const getRandomHeight = () => Math.floor(Math.random() * (400 - 200 + 1) + 200)

// 生成图片数据
const generateImages = (startIndex, count = 10) => {
  const newImages = []
  for (let i = 0; i < count; i++) {
    const id = startIndex + i
    const randomHeight = getRandomHeight()
    newImages.push({
      id,
      url: `https://picsum.photos/300/${randomHeight}?random=${id}`,
      loaded: false,
      error: false,
      style: {
        position: 'absolute',
        width: '300px',
        left: '0px',
        top: '0px',
        opacity: '0',
        transform: 'translateY(50px)',
        transition: 'opacity 0.5s, transform 0.5s, top 0.5s, left 0.5s'
      }
    })
  }
  return newImages
}

// 计算图片位置
const calculatePosition = (image, height) => {
  const minHeight = Math.min(...columnHeights.value)
  const columnIndex = columnHeights.value.indexOf(minHeight)
  
  image.style.left = `${columnIndex * 320}px`
  image.style.top = `${minHeight}px`
  image.style.opacity = '1'
  image.style.transform = 'translateY(0)'
  
  columnHeights.value[columnIndex] += height + 20 // 加上间距
  
  updateContainerHeight()
}

// 更新容器高度
const updateContainerHeight = () => {
  if (container.value) {
    const maxHeight = Math.max(...columnHeights.value)
    container.value.style.height = `${maxHeight + 50}px`
  }
}

// 图片加载完成处理
const onImageLoad = (event, image) => {
  const imgElement = event.target
  const height = imgElement.naturalHeight
  
  image.loaded = true
  calculatePosition(image, height)
}

// 图片加载失败处理
const onImageError = (image) => {
  image.error = true
  image.loaded = false
  calculatePosition(image, 200) // 设置默认高度
}

// 创建交叉观察器
const createObserver = () => {
  const options = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1
  }

  const intersectionObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMoreImages()
    }
  }, options)

  intersectionObserver.observe(observer.value)
  return intersectionObserver
}

// 加载更多图片
const loadMoreImages = () => {
  const newImages = generateImages(images.value.length)
  images.value.push(...newImages)
}

// 处理窗口大小变化
const handleResize = () => {
  if (!process.client) return
  
  const newColumnCount = Math.floor(window.innerWidth / 320)
  if (newColumnCount !== columnCount.value) {
    columnCount.value = newColumnCount
    columnHeights.value = new Array(columnCount.value).fill(0)
    
    // 重新计算所有已加载图片的位置
    images.value.forEach(image => {
      if (image.loaded) {
        const imgElement = document.querySelector(`img[alt="Random image ${image.id}"]`)
        if (imgElement) {
          calculatePosition(image, imgElement.naturalHeight)
        }
      } else if (image.error) {
        calculatePosition(image, 200)
      }
    })
  }
}

// 生命周期钩子
onMounted(() => {
  initColumnHeights()
  
  // 初始加载
  images.value = generateImages(0)
  
  if (process.client) {
    // 设置观察器
    const intersectionObserver = createObserver()
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    
    // 清理函数
    onUnmounted(() => {
      intersectionObserver.disconnect()
      window.removeEventListener('resize', handleResize)
    })
  }
})
</script>

<style scoped>
.waterfall-container {
  position: relative;
  margin: 0 auto;
  padding: 10px;
  min-height: 100vh;
}

.image-item {
  width: 300px;
  overflow: hidden;
}

.image-item img {
  width: 300px;
  display: block;
}

.image-item img.hidden {
  visibility: hidden;
  height: 0;
}

.loading-placeholder,
.error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-placeholder {
  background-color: #f0f0f0;
  color: #888;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-placeholder {
  background-color: #fff0f0;
  color: #d33;
}

.observer {
  width: 100%;
  height: 20px;
  position: absolute;
  bottom: 0;
}
</style>