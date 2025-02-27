import { ref } from 'vue'

export const useAlistConfig = () => {
  const baseUrl = useCookie('alist-base-url', {
    default: () => '',
    watch: true,
  })
  
  const token = useCookie('alist-token', {
    default: () => '',
    watch: true,
  })

  const isEditing = useCookie('alist-is-editing', {
    default: () => false,
    watch: true,
  })

  const isConfigured = computed(() => !!baseUrl.value)

  return {
    baseUrl,
    token,
    isConfigured,
    isEditing,
  }
} 