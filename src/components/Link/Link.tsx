import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames, mergeStyles } from '../../utils'
import type { SxProp } from '../../types'
import styles from './Link.module.css'

export type LinkProps = SxProp &
  JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children?: JSX.Element
    muted?: boolean
    onHover?: boolean
  }

export function Link(props: LinkProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'muted',
    'onHover',
    'style',
    'sx',
  ])

  return (
    <a
      {...rest}
      class={mergeClassNames(
        styles.Link,
        local.muted && styles.LinkMuted,
        local.onHover && styles.LinkOnHover,
        local.class,
      )}
      style={mergeStyles(local.style, local.sx)}
    >
      {local.children}
    </a>
  )
}
