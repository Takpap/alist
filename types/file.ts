export interface FileItem {
  name: string
  size: number
  is_dir: boolean
  modified: string
  sign?: string
  thumb?: string
  type: number
  raw_url?: string
}

export type LayoutType = 'grid' | 'list' 