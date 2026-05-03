import { splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import styles from './Flash.module.css'

export type FlashVariant = 'default' | 'warning' | 'success' | 'danger'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type Ref<T> = ((element: T) => void) | { current?: T | null } | undefined

type FlashOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  full?: boolean
  variant?: FlashVariant
}

export type FlashProps<As extends ValidComponent = 'div'> = DistributiveOmit<
  ComponentProps<As>,
  keyof FlashOwnProps<As>
> &
  FlashOwnProps<As>

function assignRef<T>(ref: Ref<T>, element: T) {
  if (typeof ref === 'function') {
    ref(element)
  } else if (ref) {
    ref.current = element
  }
}

export function Flash<As extends ValidComponent = 'div'>(
  props: FlashProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'full',
    'ref',
    'variant',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element
  const variant = () => local.variant ?? 'default'

  return (
    <Component
      component={local.as ?? 'div'}
      {...rest}
      ref={(element: unknown) => assignRef(local.ref as Ref<unknown>, element)}
      class={mergeClassNames(styles.Flash, local.className, local.class)}
      data-full={local.full ? '' : undefined}
      data-variant={variant()}
    >
      {local.children}
    </Component>
  )
}

Flash.displayName = 'Flash'

export default Flash
