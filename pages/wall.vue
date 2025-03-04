<template>
  <WaterfallFlow
    :items="images"
    :is-loading="isLoading"
    :columns="{
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    }"
    max-width="1600px"
    :column-gap="16"
    @loadMore="loadMoreImages"
    @imageLoad="handleImageLoad"
    @imageError="handleImageError"
    @itemClick="handleItemClick"
    @resize="handleResize"
  />
</template>

<script setup>
import { ref } from 'vue'

const images = ref([])
const isLoading = ref(false)

// 生成随机高度
const getRandomHeight = () => Math.floor(Math.random() * (400 - 200 + 1) + 200)

// 生成图片数据
const generateImages = (startIndex, count = 10) => {
  const newImages = []
  for (let i = 0; i < count; i++) {
    const id = startIndex + i
    // 使用固定宽度600，随机生成高度来创建不同的宽高比
    const width = 300
    const height = getRandomHeight()
    newImages.push({
      id,
      url: `https://picsum.photos/${width}/${height}?random=${id}`,
      alt: `Random image ${id}`,
      loaded: false,
      error: false
    })
  }
  return newImages
}

// 加载更多图片
const loadMoreImages = async () => {
  if (isLoading.value) return
  isLoading.value = true
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 800))
  
  const newImages = generateImages(images.value.length)
  images.value.push(...newImages)
  isLoading.value = false
}

// 处理图片加载完成
const handleImageLoad = ({ item, height }) => {
  console.log(`Image ${item.id} loaded with height: ${height}px`)
}

// 处理图片加载失败
const handleImageError = (item) => {
  console.error(`Failed to load image ${item.id}`)
}

// 处理图片点击
const handleItemClick = (item) => {
  console.log('Clicked image:', item)
}

// 处理布局变化
const handleResize = ({ columnCount }) => {
  console.log(`Layout changed to ${columnCount} columns`)
}

// 初始加载
images.value = generateImages(0)
</script>