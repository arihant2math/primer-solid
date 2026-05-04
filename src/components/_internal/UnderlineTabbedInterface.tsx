import { Show, splitProps, type ComponentProps, type JSX, type ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import { assignRef, type RefProp } from '../../utils/solid'
import { CounterLabel } from '../CounterLabel'
import styles from './UnderlineTabbedInterface.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

export type UnderlineItemVisual = JSX.Element | ValidComponent

export const GAP = 8

function getTextContent(children: unknown): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(getTextContent).join('')
  }

  return ''
}

function renderVisual(visual: UnderlineItemVisual | undefined) {
  if (!visual) return undefined

  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  if (typeof visual === 'function') {
    return <Component component={visual as ValidComponent} />
  }

  return visual
}

type UnderlineWrapperOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<unknown>
}

export type UnderlineWrapperProps<As extends ValidComponent = 'div'> =
  DistributiveOmit<ComponentProps<As>, keyof UnderlineWrapperOwnProps<As>> &
    UnderlineWrapperOwnProps<As>

export function UnderlineWrapper<As extends ValidComponent = 'div'>(
  props: UnderlineWrapperProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'ref',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={(local.as ?? 'div') as ValidComponent}
      {...(rest as Record<string, unknown>)}
      ref={(element: unknown) => assignRef(local.ref, element)}
      class={mergeClassNames(styles.UnderlineWrapper, local.className, local.class)}
    >
      {local.children}
    </Component>
  )
}

export type UnderlineItemListProps = JSX.HTMLAttributes<HTMLUListElement> & {
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<HTMLUListElement>
}

export function UnderlineItemList(props: UnderlineItemListProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'ref',
  ])

  return (
    <ul
      {...rest}
      ref={(element) => assignRef(local.ref, element)}
      class={mergeClassNames(styles.UnderlineItemList, local.className, local.class)}
    >
      {local.children}
    </ul>
  )
}

export function LoadingCounter() {
  return <span class={styles.LoadingCounter} />
}

type UnderlineItemOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<unknown>
  iconsVisible?: boolean
  loadingCounters?: boolean
  counter?: number | string
  icon?: UnderlineItemVisual
}

export type UnderlineItemProps<As extends ValidComponent = 'a'> =
  DistributiveOmit<ComponentProps<As>, keyof UnderlineItemOwnProps<As>> &
    UnderlineItemOwnProps<As>

export function UnderlineItem<As extends ValidComponent = 'a'>(
  props: UnderlineItemProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'counter',
    'icon',
    'iconsVisible',
    'loadingCounters',
    'ref',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element
  const textContent = () => getTextContent(local.children)

  return (
    <Component
      component={(local.as ?? 'a') as ValidComponent}
      {...(rest as Record<string, unknown>)}
      ref={(element: unknown) => assignRef(local.ref, element)}
      class={mergeClassNames(styles.UnderlineItem, local.className, local.class)}
    >
      <Show when={local.iconsVisible !== false && local.icon}>
        <span data-component="icon">{renderVisual(local.icon)}</span>
      </Show>
      <Show when={local.children !== undefined && local.children !== null}>
        <span data-component="text" data-content={textContent() || undefined}>
          {local.children}
        </span>
      </Show>
      <Show when={local.counter !== undefined}>
        <span data-component="counter">
          <Show when={!local.loadingCounters} fallback={<LoadingCounter />}>
            <CounterLabel>{local.counter}</CounterLabel>
          </Show>
        </span>
      </Show>
    </Component>
  )
}
