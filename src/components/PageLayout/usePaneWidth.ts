import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import type { Accessor } from 'solid-js'
import cssExports from './PageLayout.module.css'

// ----------------------------------------------------------------------------
// Types

type Measurement = `${number}px`

export type CustomWidthOptions = {
  min: Measurement
  default: Measurement
  max: Measurement
}

export type PaneWidth = 'small' | 'medium' | 'large'

export type PaneWidthValue = PaneWidth | CustomWidthOptions

export type UsePaneWidthOptions = {
  width: Accessor<PaneWidthValue>
  minWidth: Accessor<number>
  resizable: Accessor<boolean>
  widthStorageKey?: Accessor<string | undefined>
  paneRef: { current?: HTMLDivElement }
  handleRef: { current?: HTMLDivElement }
  contentWrapperRef: { current?: HTMLDivElement }
  constrainToViewport?: Accessor<boolean>
  onResizeEnd?: Accessor<((width: number) => void) | undefined>
  currentWidth?: Accessor<number | undefined>
}

export type UsePaneWidthResult = {
  readonly currentWidth: number
  currentWidthRef: { current: number }
  readonly minPaneWidth: number
  readonly maxPaneWidth: number
  getMaxPaneWidth: () => number
  saveWidth: (value: number) => void
  getDefaultWidth: () => number
}

// ----------------------------------------------------------------------------
// Constants

export const DEFAULT_MAX_WIDTH_DIFF = Number(cssExports.paneMaxWidthDiffDefault)
export const DEFAULT_SIDEBAR_MAX_WIDTH_DIFF = Number(
  cssExports.sidebarMaxWidthDiffDefault,
)
const WIDE_MAX_WIDTH_DIFF = Number(cssExports.paneMaxWidthDiffWide)
const DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT = Number(
  cssExports.paneMaxWidthDiffBreakpoint,
)
export const SSR_DEFAULT_MAX_WIDTH = 600
export const ARROW_KEY_STEP = 3

export const defaultPaneWidth: Record<PaneWidth, number> = {
  small: 256,
  medium: 296,
  large: 320,
}

// ----------------------------------------------------------------------------
// Helpers

export const isCustomWidthOptions = (
  width: PaneWidthValue,
): width is CustomWidthOptions => {
  return (
    typeof width === 'object' &&
    width !== null &&
    'min' in width &&
    'default' in width &&
    'max' in width
  )
}

export const isPaneWidth = (width: PaneWidthValue): width is PaneWidth => {
  return width === 'small' || width === 'medium' || width === 'large'
}

export const getDefaultPaneWidth = (width: PaneWidthValue): number => {
  if (isPaneWidth(width)) return defaultPaneWidth[width]
  if (isCustomWidthOptions(width)) return parseInt(width.default, 10)
  return 0
}

export function getMaxWidthDiffFromViewport(): number {
  if (typeof window === 'undefined') return DEFAULT_MAX_WIDTH_DIFF
  return window.innerWidth >= DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT
    ? WIDE_MAX_WIDTH_DIFF
    : DEFAULT_MAX_WIDTH_DIFF
}

export const updateAriaValues = (
  handle: HTMLElement | undefined,
  values: { current?: number; min?: number; max?: number },
) => {
  if (!handle) return
  if (values.min !== undefined)
    handle.setAttribute('aria-valuemin', String(values.min))
  if (values.max !== undefined)
    handle.setAttribute('aria-valuemax', String(values.max))
  if (values.current !== undefined) {
    handle.setAttribute('aria-valuenow', String(values.current))
    handle.setAttribute(
      'aria-valuetext',
      `Pane width ${values.current} pixels`,
    )
  }
}

const localStoragePersister = {
  save: (key: string, width: number) => {
    try {
      localStorage.setItem(key, width.toString())
    } catch {
      // ignore
    }
  },
  get: (key: string): number | null => {
    try {
      const storedWidth = localStorage.getItem(key)
      if (storedWidth !== null) {
        const parsed = Number(storedWidth)
        if (!Number.isNaN(parsed) && parsed > 0) return Math.round(parsed)
      }
    } catch {
      // ignore
    }
    return null
  },
}

// ----------------------------------------------------------------------------
// Hook

export function usePaneWidth(options: UsePaneWidthOptions): UsePaneWidthResult {
  const customMaxWidth = createMemo(() => {
    const width = options.width()
    return isCustomWidthOptions(width) ? parseInt(width.max, 10) : null
  })

  const minPaneWidth = createMemo(() => {
    const width = options.width()
    return isCustomWidthOptions(width)
      ? parseInt(width.min, 10)
      : options.minWidth()
  })

  const defaultWidth = createMemo(() => getDefaultPaneWidth(options.width()))

  const [currentWidthState, setCurrentWidthState] = createSignal((() => {
    const controlledWidth = options.currentWidth?.()
    if (typeof controlledWidth === 'number') return controlledWidth

    const widthStorageKey = options.widthStorageKey?.()
    const onResizeEnd = options.onResizeEnd?.()
    const shouldUseLocalStorage =
      onResizeEnd === undefined &&
      options.resizable() &&
      widthStorageKey !== undefined

    if (shouldUseLocalStorage) {
      const storedWidth = localStoragePersister.get(widthStorageKey)
      if (storedWidth !== null) return storedWidth
    }

    return defaultWidth()
  })())

  const currentWidth = createMemo(
    () => options.currentWidth?.() ?? currentWidthState(),
  )
  const currentWidthRef = { current: currentWidth() }

  const [maxPaneWidth, setMaxPaneWidth] = createSignal(
    customMaxWidth() ?? SSR_DEFAULT_MAX_WIDTH,
  )

  const maxWidthDiffRef = {
    current: options.constrainToViewport?.()
      ? DEFAULT_SIDEBAR_MAX_WIDTH_DIFF
      : DEFAULT_MAX_WIDTH_DIFF,
  }

  createEffect<
    | {
        controlledWidth: number | undefined
        defaultWidth: number
      }
    | undefined
  >((previous) => {
    const nextControlledWidth = options.currentWidth?.()
    const nextDefaultWidth = defaultWidth()

    if (previous) {
      if (nextControlledWidth !== previous.controlledWidth) {
        if (typeof nextControlledWidth === 'number') {
          setCurrentWidthState(nextControlledWidth)
        } else if (previous.controlledWidth !== undefined) {
          setCurrentWidthState(nextDefaultWidth)
        }
      } else if (
        nextDefaultWidth !== previous.defaultWidth &&
        nextControlledWidth === undefined
      ) {
        setCurrentWidthState(nextDefaultWidth)
      }
    }

    return {
      controlledWidth: nextControlledWidth,
      defaultWidth: nextDefaultWidth,
    }
  })

  createEffect(() => {
    currentWidthRef.current = currentWidth()
  })

  const getMaxPaneWidth = () => {
    const minWidth = minPaneWidth()
    const customMax = customMaxWidth()
    const constrainToViewport = options.constrainToViewport?.() ?? false

    if (typeof window === 'undefined') {
      return customMax ?? SSR_DEFAULT_MAX_WIDTH
    }

    const viewportMax = Math.max(
      minWidth,
      window.innerWidth - maxWidthDiffRef.current,
    )

    if (customMax !== null) {
      return constrainToViewport ? Math.min(customMax, viewportMax) : customMax
    }

    return viewportMax
  }

  const getDefaultWidth = () => getDefaultPaneWidth(options.width())

  const saveWidth = (value: number) => {
    const rounded = Math.round(value)
    currentWidthRef.current = rounded
    setCurrentWidthState(rounded)

    const onResizeEnd = options.onResizeEnd?.()
    if (onResizeEnd) {
      try {
        onResizeEnd(rounded)
      } catch {
        // ignore
      }
      return
    }

    const widthStorageKey = options.widthStorageKey?.()
    if (options.resizable() && widthStorageKey) {
      localStoragePersister.save(widthStorageKey, rounded)
    }
  }

  onMount(() => {
    if (!options.resizable()) return

    let lastViewportWidth = window.innerWidth

    const syncAll = () => {
      const currentViewportWidth = window.innerWidth
      const crossedBreakpoint =
        (lastViewportWidth < DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT &&
          currentViewportWidth >= DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT) ||
        (lastViewportWidth >= DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT &&
          currentViewportWidth < DEFAULT_PANE_MAX_WIDTH_DIFF_BREAKPOINT)

      lastViewportWidth = currentViewportWidth

      if (crossedBreakpoint) {
        maxWidthDiffRef.current = options.constrainToViewport?.()
          ? DEFAULT_SIDEBAR_MAX_WIDTH_DIFF
          : getMaxWidthDiffFromViewport()
      }

      const actualMax = getMaxPaneWidth()
      options.paneRef.current?.style.setProperty(
        '--pane-max-width',
        `${actualMax}px`,
      )

      const wasClamped = currentWidthRef.current > actualMax
      if (wasClamped) {
        currentWidthRef.current = actualMax
        options.paneRef.current?.style.setProperty('--pane-width', `${actualMax}px`)
      }

      updateAriaValues(options.handleRef.current, {
        max: actualMax,
        current: currentWidthRef.current,
      })

      setMaxPaneWidth(actualMax)
      if (wasClamped) setCurrentWidthState(actualMax)
    }

    maxWidthDiffRef.current = options.constrainToViewport?.()
      ? DEFAULT_SIDEBAR_MAX_WIDTH_DIFF
      : getMaxWidthDiffFromViewport()

    const initialMax = getMaxPaneWidth()
    setMaxPaneWidth(initialMax)
    options.paneRef.current?.style.setProperty('--pane-max-width', `${initialMax}px`)
    updateAriaValues(options.handleRef.current, {
      min: minPaneWidth(),
      max: initialMax,
      current: currentWidthRef.current,
    })

    if (customMaxWidth() !== null && !(options.constrainToViewport?.() ?? false)) {
      return
    }

    const THROTTLE_MS = 16
    const DEBOUNCE_MS = 150
    let lastUpdateTime = 0
    let pendingUpdate = false
    let rafId: number | null = null
    let debounceId: ReturnType<typeof setTimeout> | null = null
    let isResizing = false

    const startResizeOptimizations = () => {
      if (isResizing) return
      isResizing = true
      options.paneRef.current?.setAttribute('data-dragging', 'true')
      options.contentWrapperRef.current?.setAttribute('data-dragging', 'true')
    }

    const endResizeOptimizations = () => {
      if (!isResizing) return
      isResizing = false
      options.paneRef.current?.removeAttribute('data-dragging')
      options.contentWrapperRef.current?.removeAttribute('data-dragging')
    }

    const handleResize = () => {
      startResizeOptimizations()

      const now = Date.now()
      if (now - lastUpdateTime >= THROTTLE_MS) {
        lastUpdateTime = now
        syncAll()
      } else if (!pendingUpdate) {
        pendingUpdate = true
        rafId = requestAnimationFrame(() => {
          pendingUpdate = false
          rafId = null
          lastUpdateTime = Date.now()
          syncAll()
        })
      }

      if (debounceId !== null) clearTimeout(debounceId)
      debounceId = setTimeout(() => {
        debounceId = null
        endResizeOptimizations()
      }, DEBOUNCE_MS)
    }

    window.addEventListener('resize', handleResize)
    onCleanup(() => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      if (debounceId !== null) clearTimeout(debounceId)
      endResizeOptimizations()
      window.removeEventListener('resize', handleResize)
    })
  })

  return {
    get currentWidth() {
      return currentWidth()
    },
    currentWidthRef,
    get minPaneWidth() {
      return minPaneWidth()
    },
    get maxPaneWidth() {
      return maxPaneWidth()
    },
    getMaxPaneWidth,
    saveWidth,
    getDefaultWidth,
  }
}
