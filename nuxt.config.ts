// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@vueuse/nuxt',
    'vuetify-nuxt-module',
    '@unocss/nuxt'
  ],

  // CSS
  css: ['~/assets/css/main.css'],

  // SSR 配置
  ssr: true,

  // 配置路由
  app: {
    head: {
      title: 'Alist Client',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },

  // 配置 UnoCSS
  unocss: {
    uno: true,
    attributify: true,
    icons: {
      scale: 1.2,
    },
    shortcuts: [],
    rules: [],
    safelist: [
      'min-h-screen',
      'flex',
      'flex-col',
      'p-4',
      'px-4',
      'items-center',
      'justify-between',
      'mb-4',
      'space-x-2',
      'text-sm',
      'border',
      'rounded',
      'hover:bg-gray-100',
      'text-gray-600',
      'text-gray-400',
      'text-red-400',
      'flex-1',
      'h-full',
      'w-full',
      'overflow-auto',
      'overflow-hidden',
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'gap-4',
      'hover:bg-gray-50',
      'cursor-pointer',
      'w-12',
      'h-12',
      'flex-shrink-0',
      'object-cover',
      'text-yellow-500',
      'text-blue-500',
      'min-w-0',
      'truncate',
      'text-red-600',
      'justify-center',
      'fixed',
      'inset-0',
      'z-50',
      'z-60',
      'bg-black',
      'bg-gray-100',
      'bg-opacity-75',
      'relative',
      'absolute',
      'w-full',
      'max-w-4xl',
      'mx-auto',
      'aspect-video',
      'absolute',
      'top-4',
      'right-4',
      'text-white',
      'hover:text-gray-300',
      'opacity-0',
      'opacity-100'
    ]
  },

  // 配置构建选项
  build: {
    transpile: ['vue-easy-lightbox']
  }
})