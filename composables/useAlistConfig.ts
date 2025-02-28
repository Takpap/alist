import { ref, computed } from 'vue'
import { useCookie } from '#app'
import type { AlistConfig, SiteConfig } from '~/types/file'

export const useAlistConfig = () => {
  // 使用 cookie 存储配置
  const config = useCookie<AlistConfig>('alist-config', {
    default: () => ({
      sites: [],
      currentSiteId: null
    }),
    watch: true,
  })

  const isEditing = useCookie('alist-is-editing', {
    default: () => false,
    watch: true,
  })

  // 当前站点
  const currentSite = computed<SiteConfig | null>(() => {
    if (!config.value.currentSiteId) return null
    return config.value.sites.find(site => site.id === config.value.currentSiteId) || null
  })

  // 当前站点的 URL
  const baseUrl = computed<string>(() => currentSite.value?.url || '')
  
  // 当前站点的 token
  const token = computed<string>(() => currentSite.value?.token || '')

  // 是否已配置
  const isConfigured = computed(() => config.value.sites.length > 0)

  // 添加新站点
  const addSite = (site: Omit<SiteConfig, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    const newSite: SiteConfig = { ...site, id }
    config.value.sites.push(newSite)
    if (!config.value.currentSiteId) {
      config.value.currentSiteId = newSite.id
    }
  }

  // 更新站点
  const updateSite = (id: string, site: Partial<Omit<SiteConfig, 'id'>>) => {
    const index = config.value.sites.findIndex(s => s.id === id)
    if (index !== -1) {
      config.value.sites[index] = { ...config.value.sites[index], ...site }
    }
  }

  // 删除站点
  const deleteSite = (id: string) => {
    config.value.sites = config.value.sites.filter(site => site.id !== id)
    if (config.value.currentSiteId === id) {
      config.value.currentSiteId = config.value.sites[0]?.id || null
    }
  }

  // 切换当前站点
  const switchSite = (id: string) => {
    const site = config.value.sites.find(site => site.id === id)
    if (site) {
      config.value.currentSiteId = id
    }
  }

  return {
    config,
    currentSite,
    baseUrl,
    token,
    isConfigured,
    isEditing,
    addSite,
    updateSite,
    deleteSite,
    switchSite
  }
} 