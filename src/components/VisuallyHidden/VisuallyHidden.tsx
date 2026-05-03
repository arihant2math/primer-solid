import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames, mergeStyles } from '../../utils'
import type { ElementType, SxProp } from '../../types'
import styles from './VisuallyHidden.module.css'

export type VisuallyHiddenProps<T extends ElementType = 'span'> = SxProp &
  JSX.HTMLAttributes<HTMLElement> & {
    as?: T
    children?: JSX.Element
  }

export function VisuallyHidden<T extends ElementType = 'span'>(
  props: VisuallyHiddenProps<T>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'style',
    'sx',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={local.as ?? 'span'}
      {...rest}
      class={mergeClassNames(styles.VisuallyHidden, local.class)}
      style={mergeStyles(local.style, local.sx)}
    >
      {local.children}
    </Component>
  )
}
