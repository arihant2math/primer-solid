import type { ComponentProps, JSX, ValidComponent } from 'solid-js'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

export type Ref<T> = ((element: T) => void) | { current?: T | null } | undefined

export type TooltipDirection =
  | 'n'
  | 'ne'
  | 'e'
  | 'se'
  | 's'
  | 'sw'
  | 'w'
  | 'nw'

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'invisible'
  | 'danger'
  | 'link'

export type ButtonSize = 'small' | 'medium' | 'large'

export type AlignContent = 'start' | 'center'

export type ButtonVisual = JSX.Element | ValidComponent | null

type ButtonOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  ref?: Ref<unknown>
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  loading?: boolean
  loadingAnnouncement?: string
  inactive?: boolean
  labelWrap?: boolean
  alignContent?: AlignContent
  icon?: ButtonVisual
  leadingVisual?: ButtonVisual
  trailingVisual?: ButtonVisual
  trailingAction?: ButtonVisual
  count?: number | string
}

type ButtonA11yProps =
  | {'aria-label': string; 'aria-labelledby'?: undefined}
  | {'aria-label'?: undefined; 'aria-labelledby': string}

export type ButtonBaseProps<As extends ValidComponent = 'button'> =
  DistributiveOmit<ComponentProps<As>, keyof ButtonOwnProps<As> | 'className'> &
    ButtonOwnProps<As>

export type ButtonProps<As extends ValidComponent = 'button'> =
  ButtonBaseProps<As>

export type LinkButtonProps<As extends ValidComponent = 'a'> =
  ButtonBaseProps<As> & {
    disabled?: boolean
  }

type IconButtonOwnProps<As extends ValidComponent> = ButtonA11yProps &
  Omit<
    ButtonOwnProps<As>,
    | 'children'
    | 'alignContent'
    | 'icon'
    | 'leadingVisual'
    | 'trailingVisual'
    | 'trailingAction'
    | 'count'
  > & {
    icon: NonNullable<ButtonVisual>
    unsafeDisableTooltip?: boolean
    description?: string
    tooltipDirection?: TooltipDirection
    /** @deprecated Use `keybindingHint` instead. */
    keyshortcuts?: string
    keybindingHint?: string | string[]
  }

export type IconButtonProps<As extends ValidComponent = 'button'> =
  DistributiveOmit<
    ComponentProps<As>,
    keyof IconButtonOwnProps<As> | 'className'
  > &
    IconButtonOwnProps<As>
