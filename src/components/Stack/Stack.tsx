import { splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import {
  getResponsiveAttributes,
  mapResponsiveValue,
  mergeClassNames,
  mergeStyles,
} from '../../utils'
import type { SxProp } from '../../types'
import type { ResponsiveValue } from '../../utils'
import styles from './Stack.module.css'

export type { ResponsiveValue } from '../../utils'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

export type StackGapScale =
  | 'none'
  | 'tight'
  | 'condensed'
  | 'cozy'
  | 'normal'
  | 'spacious'
export type StackGap = StackGapScale | ResponsiveValue<StackGapScale>

export type StackDirectionScale = 'vertical' | 'horizontal'
export type StackDirection =
  | StackDirectionScale
  | ResponsiveValue<StackDirectionScale>

export type StackAlignScale =
  | 'start'
  | 'center'
  | 'end'
  | 'stretch'
  | 'baseline'
export type StackAlign = StackAlignScale | ResponsiveValue<StackAlignScale>

export type StackWrapScale = 'wrap' | 'nowrap'
export type StackWrap = StackWrapScale | ResponsiveValue<StackWrapScale>

export type StackJustifyScale =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-evenly'
export type StackJustifyCompatScale = StackJustifyScale | 'between'
export type StackJustify =
  | StackJustifyCompatScale
  | ResponsiveValue<StackJustifyCompatScale>

export type StackPaddingScale =
  | 'none'
  | 'tight'
  | 'condensed'
  | 'cozy'
  | 'normal'
  | 'spacious'
export type StackPadding = StackPaddingScale | ResponsiveValue<StackPaddingScale>

type StackOwnProps<As extends ValidComponent> = SxProp & {
  align?: StackAlign
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  direction?: StackDirection
  gap?: StackGap | number
  justify?: StackJustify
  padding?: StackPadding
  paddingBlock?: StackPadding
  paddingInline?: StackPadding
  wrap?: StackWrap | boolean
}

export type StackProps<As extends ValidComponent = 'div'> = DistributiveOmit<
  ComponentProps<As>,
  keyof StackOwnProps<As> | 'className'
> &
  StackOwnProps<As>

type StackItemOwnProps<As extends ValidComponent> = SxProp & {
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  grow?: boolean | ResponsiveValue<boolean>
  shrink?: boolean | ResponsiveValue<boolean>
}

export type StackItemProps<As extends ValidComponent = 'div'> =
  DistributiveOmit<
    ComponentProps<As>,
    keyof StackItemOwnProps<As> | 'className'
  > &
    StackItemOwnProps<As>

function normalizeJustifyValue(value: StackJustifyCompatScale): StackJustifyScale {
  return value === 'between' ? 'space-between' : value
}

function normalizeWrapValue(value: StackWrapScale | boolean): StackWrapScale {
  return typeof value === 'boolean' ? (value ? 'wrap' : 'nowrap') : value
}

export function StackImpl<As extends ValidComponent = 'div'>(
  props: StackProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'align',
    'as',
    'children',
    'class',
    'className',
    'direction',
    'gap',
    'justify',
    'padding',
    'paddingBlock',
    'paddingInline',
    'style',
    'sx',
    'wrap',
  ])

  const normalizedAlign = () => local.align ?? 'stretch'
  const normalizedDirection = () => local.direction ?? 'vertical'
  const normalizedGap = () =>
    typeof local.gap === 'number' ? undefined : local.gap
  const normalizedJustify = () =>
    mapResponsiveValue(local.justify ?? 'start', normalizeJustifyValue)
  const normalizedPadding = () => local.padding ?? 'none'
  const normalizedWrap = () =>
    mapResponsiveValue(local.wrap ?? 'nowrap', normalizeWrapValue)

  return (
    <Dynamic
      component={local.as ?? 'div'}
      {...rest}
      class={mergeClassNames(styles.Stack, local.className, local.class)}
      {...getResponsiveAttributes('align', normalizedAlign())}
      {...getResponsiveAttributes('direction', normalizedDirection())}
      {...getResponsiveAttributes('gap', normalizedGap())}
      {...getResponsiveAttributes('justify', normalizedJustify())}
      {...getResponsiveAttributes('padding', normalizedPadding())}
      {...getResponsiveAttributes('padding-block', local.paddingBlock)}
      {...getResponsiveAttributes('padding-inline', local.paddingInline)}
      {...getResponsiveAttributes('wrap', normalizedWrap())}
      style={mergeStyles(
        typeof local.gap === 'number' ? { gap: `${local.gap}px` } : undefined,
        local.style,
        local.sx,
      )}
    >
      {local.children}
    </Dynamic>
  )
}

export function StackItem<As extends ValidComponent = 'div'>(
  props: StackItemProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'grow',
    'shrink',
    'style',
    'sx',
  ])

  return (
    <Dynamic
      component={local.as ?? 'div'}
      {...rest}
      class={mergeClassNames(styles.StackItem, local.className, local.class)}
      {...getResponsiveAttributes('grow', local.grow)}
      {...getResponsiveAttributes('shrink', local.shrink)}
      style={mergeStyles(local.style, local.sx)}
    >
      {local.children}
    </Dynamic>
  )
}
