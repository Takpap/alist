import type { CSSProperties } from 'vue'

export interface FileItem {
  name: string
  size: number
  is_dir: boolean
  modified: string
  sign?: string
  thumb?: string
  type: number
  raw_url?: string
  style?: CSSProperties
}

export type LayoutType = 'grid' | 'list'

export interface SiteConfig {
  id: string
  name: string
  url: string
  token?: string
}

export interface AlistConfig {
  sites: SiteConfig[]
  currentSiteId: string | null
} 