import { splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames, mergeStyles } from '../../utils'
import styles from './BaseStyles.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type BaseStylesOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  color?: string
}

export type BaseStylesProps<As extends ValidComponent = 'div'> =
  DistributiveOmit<ComponentProps<As>, keyof BaseStylesOwnProps<As>> &
    BaseStylesOwnProps<As>

export function BaseStyles<As extends ValidComponent = 'div'>(
  props: BaseStylesProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'color',
    'style',
  ])

  return (
    <Dynamic
      component={(local.as ?? 'div') as ValidComponent}
      data-component="BaseStyles"
      data-portal-root
      {...rest}
      class={mergeClassNames(styles.BaseStyles, local.className, local.class)}
      style={mergeStyles(
        local.color
          ? ({ '--BaseStyles-fgColor': local.color } as JSX.CSSProperties)
          : undefined,
        local.style,
      )}
    >
      {local.children}
    </Dynamic>
  )
}

export default BaseStyles
