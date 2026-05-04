import {
  children as resolveChildren,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import {
  isResponsiveValue,
  mergeClassNames,
  mergeStyles,
  type ResponsiveValue,
} from '../../utils'
import { DEFAULT_AVATAR_SIZE } from '../Avatar'
import styles from './AvatarStack.module.css'

type Viewport = 'narrow' | 'regular' | 'wide'
type AvatarSizes = Record<Viewport, number>

const nonValidSelectors = {
  disabled: '[disabled]',
  hidden: '[hidden]',
  inert: '[inert]',
  negativeTabIndex: '[tabindex="-1"]',
}

const interactiveElementsSelectors = [
  'a[href]',
  'button',
  'summary',
  'select',
  'input:not([type=hidden])',
  'textarea',
  '[tabindex="0"]',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]',
]

const interactiveSelector = interactiveElementsSelectors
  .map(
    (selector) =>
      `${selector}:not(${Object.values(nonValidSelectors).join('):not(')})`,
  )
  .join(', ')

function getDefaultAvatarSizes(): AvatarSizes {
  return {
    narrow: DEFAULT_AVATAR_SIZE,
    regular: DEFAULT_AVATAR_SIZE,
    wide: DEFAULT_AVATAR_SIZE,
  }
}

function isAvatarElement(element: Element): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element.getAttribute('data-component') === 'Avatar'
  )
}

function parsePixelValue(value: string) {
  const parsed = Number.parseFloat(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function getAvatarSizes(element: HTMLElement): AvatarSizes {
  const regular =
    parsePixelValue(element.style.getPropertyValue('--avatarSize-regular')) ??
    DEFAULT_AVATAR_SIZE

  if (!element.hasAttribute('data-responsive')) {
    return {
      narrow: regular,
      regular,
      wide: regular,
    }
  }

  return {
    narrow:
      parsePixelValue(element.style.getPropertyValue('--avatarSize-narrow')) ??
      DEFAULT_AVATAR_SIZE,
    regular,
    wide:
      parsePixelValue(element.style.getPropertyValue('--avatarSize-wide')) ??
      DEFAULT_AVATAR_SIZE,
  }
}

function getAvatarChildSizes(container: HTMLElement): AvatarSizes {
  const minSizes: AvatarSizes = {
    narrow: Number.POSITIVE_INFINITY,
    regular: Number.POSITIVE_INFINITY,
    wide: Number.POSITIVE_INFINITY,
  }
  let hasAvatarChildren = false

  for (const child of Array.from(container.children)) {
    if (!isAvatarElement(child)) continue

    hasAvatarChildren = true
    const childSizes = getAvatarSizes(child)

    minSizes.narrow = Math.min(minSizes.narrow, childSizes.narrow)
    minSizes.regular = Math.min(minSizes.regular, childSizes.regular)
    minSizes.wide = Math.min(minSizes.wide, childSizes.wide)
  }

  return hasAvatarChildren ? minSizes : getDefaultAvatarSizes()
}

function isNonValidInteractiveNode(node: HTMLElement) {
  if (node.matches('[disabled], [hidden], [inert]')) return true

  const nodeStyle = getComputedStyle(node)
  return nodeStyle.display === 'none' || nodeStyle.visibility === 'hidden'
}

function hasInteractiveNodes(node: HTMLElement | null) {
  if (!node || isNonValidInteractiveNode(node)) return false

  const candidates = node.querySelectorAll<HTMLElement>(interactiveSelector)

  for (const candidate of candidates) {
    if (!isNonValidInteractiveNode(candidate)) return true
  }

  return false
}

function syncChildPresentation(container: HTMLElement, shape: 'circle' | 'square') {
  for (const child of Array.from(container.children)) {
    if (!(child instanceof HTMLElement)) continue

    child.classList.add(styles.AvatarItem)

    if (!isAvatarElement(child)) continue

    if (shape === 'square') {
      if (!child.hasAttribute('data-square')) {
        child.setAttribute('data-square', '')
        child.setAttribute('data-avatar-stack-square', '')
      }
    } else if (child.hasAttribute('data-avatar-stack-square')) {
      child.removeAttribute('data-avatar-stack-square')
      child.removeAttribute('data-square')
    }
  }
}

export type AvatarStackProps = {
  alignRight?: boolean
  disableExpand?: boolean
  variant?: 'cascade' | 'stack'
  shape?: 'circle' | 'square'
  size?: number | ResponsiveValue<number>
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  style?: JSX.CSSProperties | string
}

export function AvatarStack(props: AvatarStackProps) {
  let bodyRef: HTMLDivElement | undefined

  const [local] = splitProps(props, [
    'alignRight',
    'children',
    'class',
    'className',
    'disableExpand',
    'shape',
    'size',
    'style',
    'variant',
  ])

  const resolvedChildren = resolveChildren(() => local.children)
  const [childSizes, setChildSizes] = createSignal<AvatarSizes>(
    getDefaultAvatarSizes(),
  )
  const [hasInteractiveChildren, setHasInteractiveChildren] =
    createSignal(false)

  const count = createMemo(() => resolvedChildren.toArray().length)
  const shape = () => local.shape ?? 'circle'
  const variant = () => local.variant ?? 'cascade'

  const refresh = () => {
    if (!bodyRef) return

    syncChildPresentation(bodyRef, shape())
    setChildSizes(getAvatarChildSizes(bodyRef))
    setHasInteractiveChildren(hasInteractiveNodes(bodyRef))
  }

  createEffect(() => {
    count()
    shape()
    queueMicrotask(refresh)
  })

  onMount(() => {
    refresh()

    if (!bodyRef) return

    const observer = new MutationObserver(() => refresh())

    observer.observe(bodyRef, {
      attributes: true,
      attributeFilter: [
        'class',
        'data-component',
        'data-responsive',
        'data-square',
        'style',
      ],
      childList: true,
      subtree: true,
    })

    onCleanup(() => observer.disconnect())
  })

  const responsiveAvatarSizeStyles = () => {
    if (local.size === undefined) {
      return {
        '--stackSize-narrow': `${childSizes().narrow}px`,
        '--stackSize-regular': `${childSizes().regular}px`,
        '--stackSize-wide': `${childSizes().wide}px`,
      } as JSX.CSSProperties
    }

    if (isResponsiveValue(local.size)) {
      return {
        '--stackSize-narrow': `${local.size.narrow ?? DEFAULT_AVATAR_SIZE}px`,
        '--stackSize-regular': `${local.size.regular ?? DEFAULT_AVATAR_SIZE}px`,
        '--stackSize-wide': `${local.size.wide ?? DEFAULT_AVATAR_SIZE}px`,
      } as JSX.CSSProperties
    }

    return {
      '--avatar-stack-size': `${local.size}px`,
    } as JSX.CSSProperties
  }

  return (
    <span
      data-component="AvatarStack"
      data-variant={variant()}
      data-shape={shape()}
      data-avatar-count={count() > 3 ? '3+' : String(count())}
      data-align-right={local.alignRight ? '' : undefined}
      data-responsive={
        local.size === undefined || isResponsiveValue(local.size)
          ? ''
          : undefined
      }
      class={mergeClassNames(styles.AvatarStack, local.className, local.class)}
      style={mergeStyles(responsiveAvatarSizeStyles(), local.style)}
    >
      <div
        ref={bodyRef}
        data-component="AvatarStack.Body"
        data-disable-expand={local.disableExpand ? '' : undefined}
        class={styles.AvatarStackBody}
        tabindex={
          !hasInteractiveChildren() && !local.disableExpand ? 0 : undefined
        }
      >
        {resolvedChildren()}
      </div>
    </span>
  )
}

export default AvatarStack
