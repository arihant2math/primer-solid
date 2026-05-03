import { Show, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames, mergeStyles } from '../../utils'
import styles from './Button.module.css'

export type ButtonVariant = 'default' | 'primary' | 'danger' | 'invisible'
export type ButtonSize = 'small' | 'medium' | 'large'

export type ButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'prefix'
> & {
  children?: JSX.Element
  leadingVisual?: JSX.Element
  trailingVisual?: JSX.Element
  size?: ButtonSize
  variant?: ButtonVariant
}

const sizeClass: Record<ButtonSize, string> = {
  small: styles.ButtonSmall,
  medium: styles.ButtonMedium,
  large: styles.ButtonLarge,
}

const variantClass: Record<ButtonVariant, string | undefined> = {
  default: undefined,
  primary: styles.ButtonPrimary,
  danger: styles.ButtonDanger,
  invisible: styles.ButtonInvisible,
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'leadingVisual',
    'size',
    'style',
    'trailingVisual',
    'type',
    'variant',
  ])

  const size = () => local.size ?? 'medium'
  const variant = () => local.variant ?? 'default'

  return (
    <button
      {...rest}
      type={local.type ?? 'button'}
      class={mergeClassNames(
        styles.Button,
        sizeClass[size()],
        variantClass[variant()],
        local.class,
      )}
      style={mergeStyles(local.style)}
      data-size={size()}
      data-variant={variant()}
    >
      <Show when={local.leadingVisual}>
        <span class={styles.LeadingVisual} aria-hidden="true">
          {local.leadingVisual}
        </span>
      </Show>
      <span>{local.children}</span>
      <Show when={local.trailingVisual}>
        <span class={styles.TrailingVisual} aria-hidden="true">
          {local.trailingVisual}
        </span>
      </Show>
    </button>
  )
}
