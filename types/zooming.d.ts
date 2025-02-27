declare module 'zooming' {
  interface ZoomingOptions {
    bgColor?: string
    customSize?: string | null
    scaleBase?: number
    scaleExtra?: number
    scrollThreshold?: number
    transitionDuration?: number
    transitionTimingFunction?: string
    zIndex?: number
    enableGrab?: boolean
    onBeforeOpen?: (target: HTMLElement) => void
    onOpen?: () => void
    onClose?: () => void
    onGrab?: () => void
    onRelease?: () => void
  }

  class Zooming {
    constructor(options?: ZoomingOptions)
    open(el: HTMLElement): void
    close(): void
    listen(el: HTMLElement): void
    config(options: Partial<ZoomingOptions>): void
    isActive(): boolean
    wrapped(): HTMLElement | null
  }

  export default Zooming
} 