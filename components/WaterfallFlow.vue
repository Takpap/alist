<template>
  <div class="waterfall-container" ref="container" :style="{ maxWidth: maxWidth }">
    <div 
      v-for="item in items" 
      :key="item.id"
      :style="item.style"
      class="waterfall-item"
      @click="$emit('itemClick', item)"
    >
      <div v-if="!item.loaded && !item.error" class="loading-placeholder">
        <div class="loading-spinner"></div>
      </div>
      <slot 
        name="item" 
        :item="item"
        :loaded="item.loaded"
        :error="item.error"
      >
        <!-- 默认图片展示 -->
        <img
          :src="item.url"
          :alt="item.alt || ''"
          @load="onImageLoad($event, item)"
          @error="onImageError(item)"
          :class="{ 'hidden': !item.loaded }"
        >
      </slot>
      <div v-if="item.error" class="error-placeholder">
        <slot name="error" :item="item">
          <span>{{ errorText }}</span>
        </slot>
      </div>
    </div>
    <div ref="observer" class="observer"></div>
    
    <!-- 底部加载动画 -->
    <div v-if="isLoading" class="loading-more-container">
      <slot name="loading">
        <div class="loading-more-spinner"></div>
        <span class="loading-text">{{ loadingText }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  // 瀑布流数据项
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  // 列数控制
  columns: {
    type: [Number, Object],
    default: () => ({
      xs: 1,    // <768px
      sm: 2,    // ≥768px
      md: 3,    // ≥992px
      lg: 4,    // ≥1200px
      xl: 5     // ≥1920px
    })
  },
  // 容器最大宽度
  maxWidth: {
    type: String,
    default: '100%'
  },
  // 列间距
  columnGap: {
    type: Number,
    default: 20
  },
  // 默认图片高度（加载失败时使用）
  defaultHeight: {
    type: Number,
    default: 200
  },
  // 加载中文本
  loadingText: {
    type: String,
    default: '加载中...'
  },
  // 错误文本
  errorText: {
    type: String,
    default: '加载失败'
  },
  // 是否正在加载更多
  isLoading: {
    type: Boolean,
    default: false
  },
  // 观察器配置
  observerOptions: {
    type: Object,
    default: () => ({
      rootMargin: '100px',
      threshold: 0.1
    })
  }
})

const emit = defineEmits([
  'itemClick',
  'loadMore',
  'imageLoad',
  'imageError',
  'resize'
])

const container = ref(null)
const observer = ref(null)
const columnCount = ref(3)
const columnHeights = ref([])

// 计算当前应该显示的列数
const calculateColumnCount = () => {
  if (!process.client) return 3
  
  const width = window.innerWidth
  if (typeof props.columns === 'number') {
    return props.columns
  }
  
  if (width >= 1920) return props.columns.xl || 5
  if (width >= 1200) return props.columns.lg || 4
  if (width >= 992) return props.columns.md || 3
  if (width >= 768) return props.columns.sm || 2
  return props.columns.xs || 1
}

// 计算列宽度
const calculateColumnWidth = () => {
  if (!container.value) return props.columnWidth

  const containerWidth = container.value.clientWidth
  const totalGap = props.columnGap * (columnCount.value - 1)
  return (containerWidth - totalGap) / columnCount.value
}

// 初始化列高度数组
const initColumnHeights = () => {
  if (process.client) {
    const count = calculateColumnCount()
    columnCount.value = count
    columnHeights.value = new Array(count).fill(0)
    emit('resize', { columnCount: count })
  } else {
    columnHeights.value = new Array(columnCount.value).fill(0)
  }
}

// 计算图片位置
const calculatePosition = (item, height) => {
  const minHeight = Math.min(...columnHeights.value)
  const columnIndex = columnHeights.value.indexOf(minHeight)
  const columnWidth = calculateColumnWidth()
  
  item.style = {
    position: 'absolute',
    width: `${columnWidth}px`,
    left: `${columnIndex * (columnWidth + props.columnGap)}px`,
    top: `${minHeight}px`,
    opacity: '1',
    transform: 'translateY(0)',
    transition: 'opacity 0.5s, transform 0.5s, top 0.5s, left 0.5s'
  }
  
  columnHeights.value[columnIndex] += height + props.columnGap
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
const onImageLoad = (event, item) => {
  const imgElement = event.target
  const aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight
  const columnWidth = calculateColumnWidth()
  const height = columnWidth / aspectRatio
  
  item.loaded = true
  calculatePosition(item, height)
  emit('imageLoad', { item, height })
}

// 图片加载失败处理
const onImageError = (item) => {
  item.error = true
  item.loaded = false
  calculatePosition(item, props.defaultHeight)
  emit('imageError', item)
}

// 创建交叉观察器
const createObserver = () => {
  const intersectionObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !props.isLoading) {
      emit('loadMore')
    }
  }, props.observerOptions)

  intersectionObserver.observe(observer.value)
  return intersectionObserver
}

// 重新计算所有图片位置
const recalculateLayout = () => {
  columnHeights.value = new Array(columnCount.value).fill(0)
  
  props.items.forEach(item => {
    if (item.loaded) {
      const imgElement = document.querySelector(`img[alt="${item.alt || ''}"]`)
      if (imgElement) {
        calculatePosition(item, imgElement.naturalHeight)
      }
    } else if (item.error) {
      calculatePosition(item, props.defaultHeight)
    }
  })
}

// 处理窗口大小变化
const handleResize = () => {
  if (!process.client) return
  
  const newColumnCount = calculateColumnCount()
  if (newColumnCount !== columnCount.value) {
    columnCount.value = newColumnCount
    recalculateLayout()
    emit('resize', { columnCount: newColumnCount })
  }
}

// 监听 columns 变化
watch(() => props.columns, () => {
  if (process.client) {
    const newColumnCount = calculateColumnCount()
    if (newColumnCount !== columnCount.value) {
      columnCount.value = newColumnCount
      recalculateLayout()
      emit('resize', { columnCount: newColumnCount })
    }
  }
}, { deep: true })

// 监听 items 变化
watch(() => props.items, () => {
  nextTick(() => {
    const columnWidth = calculateColumnWidth()
    props.items.forEach(item => {
      if (!item.style) {
        item.style = {
          position: 'absolute',
          width: `${columnWidth}px`,
          opacity: '0',
          transform: 'translateY(50px)',
          transition: 'opacity 0.5s, transform 0.5s, top 0.5s, left 0.5s'
        }
      }
    })
  })
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  initColumnHeights()
  
  if (process.client) {
    const intersectionObserver = createObserver()
    window.addEventListener('resize', handleResize)
    
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
  width: 100%;
  box-sizing: border-box;
}

.waterfall-item {
  overflow: hidden;
}

.waterfall-item img {
  width: 100%;
  display: block;
}

.waterfall-item img.hidden {
  visibility: hidden;
  height: v-bind('defaultHeight + "px"');
}

.loading-placeholder,
.error-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: v-bind('defaultHeight + "px"');
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

.loading-more-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-more-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

.loading-text {
  font-size: 14px;
  color: #666;
}
</style> 