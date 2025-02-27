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
    icons: true,
  }
})