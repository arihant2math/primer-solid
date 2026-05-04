import { splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import { assignRef, type RefProp } from '../../utils/solid'
import Octicon from '../Octicon'
import type { OcticonProps } from '../Octicon'
import styles from './CircleBadge.module.css'

const variantSizes = {
  small: 56,
  medium: 96,
  large: 128,
} as const

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

function isNumeric(value: unknown): value is number | string {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'string') return false

  const parsed = Number.parseFloat(value)
  return !Number.isNaN(parsed) && Number.isFinite(parsed)
}

type CircleBadgeOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  inline?: boolean
  size?: number
  /** @deprecated `CircleBadge` does not support the `sx` prop. */
  sx?: never
  variant?: keyof typeof variantSizes
}

export type CircleBadgeProps<As extends ValidComponent = 'div'> =
  DistributiveOmit<ComponentProps<As>, keyof CircleBadgeOwnProps<As>> &
    CircleBadgeOwnProps<As>

function sizeStyles(props: Pick<CircleBadgeOwnProps<ValidComponent>, 'size' | 'variant'>) {
  const resolvedSize = isNumeric(props.size)
    ? Number(props.size)
    : variantSizes[props.variant ?? 'medium']

  return {
    width: `${resolvedSize}px`,
    height: `${resolvedSize}px`,
  } as JSX.CSSProperties
}

function CircleBadgeRoot<As extends ValidComponent = 'div'>(
  props: CircleBadgeProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'inline',
    'ref',
    'size',
    'style',
    'sx',
    'variant',
  ])

  return (
    <Dynamic
      component={(local.as ?? 'div') as ValidComponent}
      {...rest}
      ref={(element: unknown) => assignRef(local.ref as RefProp<unknown>, element)}
      class={mergeClassNames(styles.CircleBadge, local.className, local.class)}
      data-inline={local.inline ? '' : undefined}
      style={sizeStyles(local)}
    >
      {local.children}
    </Dynamic>
  )
}

CircleBadgeRoot.displayName = 'CircleBadge'

function CircleBadgeIcon(props: OcticonProps) {
  const [local, rest] = splitProps(props, ['class', 'className'])

  return (
    <Octicon
      {...rest}
      class={local.class}
      className={mergeClassNames(styles.CircleBadgeIcon, local.className)}
    />
  )
}

CircleBadgeIcon.displayName = 'CircleBadge.Icon'

export type CircleBadgeIconProps = ComponentProps<typeof CircleBadgeIcon>

/**
 * @deprecated This component is deprecated.
 * Replace it with specific icon imports from `@primer/solid` and customized styling.
 */
export const CircleBadge = Object.assign(CircleBadgeRoot, {
  Icon: CircleBadgeIcon,
})

export default CircleBadge
