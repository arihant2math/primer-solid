import { createSignal, onCleanup, onMount } from 'solid-js'

export function useOverflow(ref: { current?: HTMLElement }) {
  const [hasOverflow, setHasOverflow] = createSignal(false)

  onMount(() => {
    const element = ref.current
    if (!element) return

    const update = () => {
      setHasOverflow(
        element.scrollHeight > element.clientHeight ||
          element.scrollWidth > element.clientWidth,
      )
    }

    update()

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(() => update())
      observer.observe(element)
      onCleanup(() => observer.disconnect())
    }

    window.addEventListener('resize', update)
    onCleanup(() => window.removeEventListener('resize', update))
  })

  return hasOverflow
}
