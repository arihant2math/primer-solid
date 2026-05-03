import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames, mergeStyles } from '../../utils'
import { XIcon } from '../Octicon'
import { defaultTokenSize, type TokenSizeKeys } from './TokenBase'
import styles from './_RemoveTokenButton.module.css'

interface TokenButtonProps {
  borderOffset?: number
  size?: TokenSizeKeys
  isParentInteractive?: boolean
}

type RemoveTokenButtonProps = TokenButtonProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'size'> &
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
    className?: string
  }

export function RemoveTokenButton(props: RemoveTokenButtonProps) {
  const [local, rest] = splitProps(props, [
    'aria-label',
    'borderOffset',
    'children',
    'class',
    'className',
    'isParentInteractive',
    'size',
    'style',
  ])

  const size = () => local.size ?? defaultTokenSize
  const iconSize = () => (size() === 'small' || size() === 'medium' ? 12 : 16)
  const style = () =>
    mergeStyles(
      {
        transform: `translate(${local.borderOffset ?? 0}px, -${local.borderOffset ?? 0}px)`,
      },
      local.style,
    )

  if (local.isParentInteractive) {
    return (
      <span
        {...(rest as JSX.HTMLAttributes<HTMLSpanElement>)}
        tabIndex={-1}
        aria-label={local['aria-label']}
        data-size={size()}
        class={mergeClassNames(
          styles.TokenButton,
          local.className,
          local.class,
        )}
        style={style()}
      >
        <XIcon size={iconSize()} />
      </span>
    )
  }

  return (
    <button
      {...(rest as JSX.ButtonHTMLAttributes<HTMLButtonElement>)}
      aria-label="Remove token"
      data-size={size()}
      class={mergeClassNames(styles.TokenButton, local.className, local.class)}
      style={style()}
      type="button"
    >
      <XIcon size={iconSize()} />
    </button>
  )
}

export default RemoveTokenButton
