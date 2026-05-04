import { splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames, mergeStyles } from '../../utils'
import { assignRef, type RefProp } from '../../utils/solid'
import styles from './Truncate.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type TruncateOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  title: string
  inline?: boolean
  expandable?: boolean
  maxWidth?: number | string
}

export type TruncateProps<As extends ValidComponent = 'div'> =
  DistributiveOmit<ComponentProps<As>, keyof TruncateOwnProps<As>> &
    TruncateOwnProps<As>

function resolveMaxWidth(maxWidth: number | string | undefined) {
  const value = maxWidth ?? 125
  return typeof value === 'number' ? `${value}px` : value
}

export function Truncate<As extends ValidComponent = 'div'>(
  props: TruncateProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'expandable',
    'inline',
    'maxWidth',
    'ref',
    'style',
    'title',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={local.as ?? 'div'}
      {...rest}
      ref={(element: unknown) => {
        assignRef(local.ref as RefProp<unknown>, element)
      }}
      class={mergeClassNames(local.className, local.class, styles.Truncate)}
      data-expandable={local.expandable ? true : undefined}
      data-inline={local.inline ? true : undefined}
      title={local.title}
      style={mergeStyles(local.style, {
        '--truncate-max-width': resolveMaxWidth(local.maxWidth),
      } as JSX.CSSProperties)}
    >
      {local.children}
    </Component>
  )
}

export default Truncate
