<!-- components/file-list/FileList.vue -->
<template>
  <div>
    <!-- Layout Controls -->
    <div class="flex items-center space-x-4 mb-4 w-full">
      <!-- Path Navigation -->
      <div class="flex items-center gap-2 text-sm min-w-0 overflow-hidden">
        <button
          class="text-blue-600 hover:text-blue-800 focus:outline-none flex-shrink-0"
          @click="navigateBack"
          :disabled="currentPath === '/'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex items-center gap-2 overflow-hidden">
          <template v-for="(segment, index) in pathSegments" :key="index">
            <button
              class="text-blue-600 hover:text-blue-800 focus:outline-none flex-shrink-0"
              @click="navigateTo(getPathUpTo(index))"
            >
              {{ segment || 'Home' }}
            </button>
            <span v-if="index < pathSegments.length - 1" class="text-gray-400 flex-shrink-0">/</span>
          </template>
        </div>
      </div>

      <div class="flex items-center gap-4 flex-shrink-0 ml-auto">
        <div v-if="layout === 'grid'" class="flex items-center gap-2">
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            v-model.number="gridColumns"
            class="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span class="text-sm text-gray-600 w-16">{{ gridColumns }} 列</span>
        </div>
        <button
          class="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          @click="toggleLayout"
        >
          <svg v-if="layout === 'grid'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 13a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex items-center justify-center py-12 text-red-600">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!files.length" class="flex flex-col items-center justify-center py-12 text-gray-500">
      <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
      </svg>
      <p>This folder is empty</p>
    </div>

    <!-- Grid View -->
    <div
      v-else-if="layout === 'grid'"
      class="columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-8 2xl:columns-10 gap-4 space-y-4"
      :style="{
        'columns': gridColumns < 10 ? gridColumns : undefined
      }"
    >
      <div
        v-for="file in files"
        :key="file.name"
        class="break-inside-avoid-column mb-4 group rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
        @click="onFileClick(file)"
      >
        <!-- Folder -->
        <div v-if="file.is_dir" class="flex flex-col items-center p-4">
          <div class="relative w-full aspect-square flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div class="mt-2 text-sm text-center truncate w-full" :title="file.name">{{ file.name }}</div>
        </div>

        <!-- Image -->
        <div v-else-if="isImage(file)" class="flex flex-col bg-white rounded-lg overflow-hidden">
          <div class="relative w-full">
            <img
              :src="file.thumb || ''"
              :data-src="file.name"
              class="w-full rounded-lg cursor-zoom-in object-cover"
              loading="lazy"
              alt=""
              @load="onImageLoad($event, file)"
              :title="`${file.name}\n${formatFileSize(file.size)}`"
            />
          </div>
          <div class="p-2 text-sm truncate" :title="`${file.name}\n${formatFileSize(file.size)}`">{{ file.name }}</div>
        </div>

        <!-- Video -->
        <div v-else-if="isVideo(file)" class="flex flex-col bg-white rounded-lg overflow-hidden">
          <div class="relative w-full aspect-video">
            <img
              :src="file.thumb || ''"
              class="w-full h-full object-cover rounded-lg"
              loading="lazy"
              alt=""
              :title="`${file.name}\n${formatFileSize(file.size)}`"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="p-2 rounded-full bg-black/50">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="p-2 text-sm truncate" :title="`${file.name}\n${formatFileSize(file.size)}`">{{ file.name }}</div>
        </div>

        <!-- Other Files -->
        <div v-else class="flex flex-col items-center p-4">
          <div class="relative w-full aspect-square flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="mt-2 text-sm text-center truncate w-full" :title="`${file.name}\n${formatFileSize(file.size)}`">{{ file.name }}</div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="divide-y divide-gray-200 -mx-4">
      <div
        v-for="file in files"
        :key="file.name"
        class="flex items-center py-2 px-4 hover:bg-gray-50 cursor-pointer transition-colors"
        @click="onFileClick(file)"
      >
        <!-- Folder -->
        <div v-if="file.is_dir" class="flex items-center flex-1 min-w-0">
          <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div class="ml-4 flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate" :title="file.name">{{ file.name }}</div>
            <div class="text-xs text-gray-500">{{ file.modified }}</div>
          </div>
        </div>

        <!-- Image -->
        <div v-else-if="isImage(file)" class="flex items-center flex-1 min-w-0">
          <div class="w-12 h-12 flex-shrink-0">
            <img
              :src="file.thumb || ''"
              :data-src="file.name"
              class="w-full h-full object-cover rounded-lg cursor-zoom-in"
              loading="lazy"
              alt=""
              :title="`${file.name}\n${formatFileSize(file.size)}`"
            />
          </div>
          <div class="ml-4 flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate" :title="`${file.name}\n${formatFileSize(file.size)}`">{{ file.name }}</div>
            <div class="text-xs text-gray-500">{{ file.modified }} · {{ formatFileSize(file.size) }}</div>
          </div>
        </div>

        <!-- Video -->
        <div v-else-if="isVideo(file)" class="flex items-center flex-1 min-w-0">
          <div class="relative w-12 h-12 flex-shrink-0">
            <img
              :src="file.thumb || ''"
              class="w-full h-full object-cover rounded-lg"
              loading="lazy"
              alt=""
              :title="`${file.name}\n${formatFileSize(file.size)}`"
            />
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="p-1 rounded-full bg-black/50">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
          <div class="ml-4 flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate" :title="`${file.name}\n${formatFileSize(file.size)}`">{{ file.name }}</div>
            <div class="text-xs text-gray-500">{{ file.modified }} · {{ formatFileSize(file.size) }}</div>
          </div>
        </div>

        <!-- Other Files -->
        <div v-else class="flex items-center flex-1 min-w-0">
          <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="ml-4 flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-900 truncate" :title="`${file.name}\n${formatFileSize(file.size)}`">{{ file.name }}</div>
            <div class="text-xs text-gray-500">{{ file.modified }} · {{ formatFileSize(file.size) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Preview -->
    <VideoPreview v-model="previewVideo" ref="videoPlayer" />
    <!-- Image Preview -->
    <ImagePreview v-model="previewImage" />
  </div>
</template>

<script setup lang="ts">
import type { FileItem } from '~/types/file'
import { isImage, isVideo, formatFileSize } from '~/utils/file'
import { useFileList } from '~/composables/file/useFileList'
import { useLayout } from '~/composables/file/useLayout'
import { usePreview } from '~/composables/file/usePreview'
import VideoPreview from '~/components/preview/VideoPreview.vue'
import ImagePreview from '~/components/preview/ImagePreview.vue'

const {
  currentPath,
  files,
  loading,
  error,
  navigateBack,
  navigateTo,
  pathSegments,
  getPathUpTo
} = useFileList()

const {
  layout,
  gridColumns,
  toggleLayout
} = useLayout()

const {
  previewVideo,
  previewImage,
  videoPlayer,
  handleFileClick,
  closePreview
} = usePreview()

const onFileClick = async (file: FileItem) => {
  // 关闭之前的预览
  closePreview()
  
  const result = await handleFileClick(file, currentPath.value)
  if (result.type === 'directory') {
    const newPath = currentPath.value === '/' 
      ? `/${file.name}`
      : `${currentPath.value}/${file.name}`
    navigateTo(newPath)
  }
  // 其他类型的文件会由 handleFileClick 自动处理预览状态
}

// 添加图片加载处理函数
const onImageLoad = (event: Event, file: FileItem) => {
  const img = event.target as HTMLImageElement
  // 设置图片的高度为宽度的比例
  const ratio = img.naturalHeight / img.naturalWidth
  img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`
}
</script> 