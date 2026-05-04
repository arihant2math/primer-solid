import { children as resolveChildren, splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import { assignRef, callEventHandler, type RefProp } from '../../utils/solid'
import styles from './ButtonGroup.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type ButtonGroupOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  /** The role of the group */
  role?: string
}

export type ButtonGroupProps<As extends ValidComponent = 'div'> =
  DistributiveOmit<ComponentProps<As>, keyof ButtonGroupOwnProps<As>> &
    ButtonGroupOwnProps<As>

const focusableSelector = [
  'button:not([disabled])',
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function flattenChildren(value: JSX.Element): Array<Exclude<JSX.Element, null | undefined | boolean>> {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenChildren(item as JSX.Element))
  }

  if (value === null || value === undefined || typeof value === 'boolean') {
    return []
  }

  return [value as Exclude<JSX.Element, null | undefined | boolean>]
}

function getFocusableItems(container: HTMLElement) {
  return Array.from(container.children).flatMap((child) => {
    const target = child.matches(focusableSelector)
      ? child
      : child.querySelector(focusableSelector)

    if (!(target instanceof HTMLElement)) return []
    if (target.getAttribute('aria-disabled') === 'true') return []

    return [target]
  })
}

export function ButtonGroup<As extends ValidComponent = 'div'>(
  props: ButtonGroupProps<As>,
) {
  let elementRef: HTMLElement | undefined

  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'onKeyDown',
    'ref',
    'role',
  ])

  const resolvedChildren = resolveChildren(() => local.children)
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  const wrappedChildren = () =>
    flattenChildren(resolvedChildren()).map((child) => <div>{child}</div>)

  const handleKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (
    event,
  ) => {
    callEventHandler(local.onKeyDown, event)

    if (
      local.role !== 'toolbar' ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !elementRef
    ) {
      return
    }

    const isRtl = getComputedStyle(elementRef).direction === 'rtl'
    const previousKey = isRtl ? 'ArrowRight' : 'ArrowLeft'
    const nextKey = isRtl ? 'ArrowLeft' : 'ArrowRight'

    if (event.key !== previousKey && event.key !== nextKey) {
      return
    }

    const target = event.target
    if (!(target instanceof Node)) {
      return
    }

    const items = getFocusableItems(elementRef)
    if (items.length < 2) {
      return
    }

    const currentIndex = items.findIndex(
      (item) => item === target || item.contains(target),
    )

    if (currentIndex === -1) {
      return
    }

    event.preventDefault()

    const direction = event.key === nextKey ? 1 : -1
    const nextIndex = (currentIndex + direction + items.length) % items.length
    items[nextIndex]?.focus()
  }

  return (
    <Component
      component={(local.as ?? 'div') as ValidComponent}
      {...rest}
      ref={(element: unknown) => {
        elementRef = element instanceof HTMLElement ? element : undefined
        assignRef(local.ref as RefProp<unknown>, element)
      }}
      class={mergeClassNames(local.className, local.class, styles.ButtonGroup)}
      role={local.role}
      onKeyDown={handleKeyDown}
    >
      {wrappedChildren()}
    </Component>
  )
}

ButtonGroup.displayName = 'ButtonGroup'

export default ButtonGroup
