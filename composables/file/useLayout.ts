import { ref, watch } from 'vue'
import type { LayoutType } from '~/types/file'

export const useLayout = () => {
  const layout = ref<LayoutType>('grid')
  const gridColumns = ref<number>(3)

  const toggleLayout = () => {
    layout.value = layout.value === 'grid' ? 'list' : 'grid'
  }

  // 保存布局到 localStorage
  const saveLayout = () => {
    localStorage.setItem('alist-layout', layout.value)
    if (layout.value === 'grid') {
      localStorage.setItem('alist-grid-columns', gridColumns.value.toString())
    }
  }

  // 监听布局变化
  watch(layout, () => {
    saveLayout()
  })

  // 监听列数变化
  watch(gridColumns, () => {
    if (layout.value === 'grid') {
      localStorage.setItem('alist-grid-columns', gridColumns.value.toString())
    }
  })

  // 初始化时加载上次布局
  onMounted(() => {
    const savedLayout = localStorage.getItem('alist-layout')
    if (savedLayout === 'grid' || savedLayout === 'list') {
      layout.value = savedLayout
    }
    if (layout.value === 'grid') {
      const savedGridColumns = localStorage.getItem('alist-grid-columns')
      if (savedGridColumns) {
        const columns = parseInt(savedGridColumns)
        if (columns >= 2 && columns <= 10) {
          gridColumns.value = columns
        }
      }
    }
  })

  return {
    layout,
    gridColumns,
    toggleLayout
  }
} 