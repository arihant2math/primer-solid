import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { isResponsiveValue, mergeClassNames, mergeStyles } from '../../utils'
import type { ResponsiveValue } from '../../utils'
import type { SxProp } from '../../types'
import { assignRef, type RefProp } from '../../utils/solid'
import styles from './Avatar.module.css'

export const DEFAULT_AVATAR_SIZE = 20

export type AvatarProps = SxProp &
  Omit<JSX.ImgHTMLAttributes<HTMLImageElement>, 'className' | 'size'> & {
    size?: number | ResponsiveValue<number>
    square?: boolean
    class?: string
    /** React compatibility alias. Prefer `class` in Solid code. */
    className?: string
    ref?: RefProp<HTMLImageElement>
  }

function getCssSizeVars(size: AvatarProps['size']) {
  const cssSizeVars = {} as JSX.CSSProperties

  if (isResponsiveValue<number>(size)) {
    for (const [key, value] of Object.entries(size)) {
      if (value !== undefined) {
        cssSizeVars[`--avatarSize-${key}`] = `${value}px`
      }
    }
  } else {
    cssSizeVars['--avatarSize-regular'] = `${size}px`
  }

  return cssSizeVars
}

export function Avatar(props: AvatarProps) {
  const [local, rest] = splitProps(props, [
    'alt',
    'class',
    'className',
    'height',
    'ref',
    'size',
    'square',
    'style',
    'sx',
    'width',
  ])

  const size = () => local.size ?? DEFAULT_AVATAR_SIZE
  const responsive = () => isResponsiveValue<number>(size())

  return (
    <img
      {...rest}
      ref={(element) => assignRef(local.ref, element)}
      alt={local.alt ?? ''}
      class={mergeClassNames(styles.Avatar, local.className, local.class)}
      data-component="Avatar"
      data-responsive={responsive() ? '' : undefined}
      data-square={local.square ? '' : undefined}
      width={local.width ?? (responsive() ? undefined : (size() as number))}
      height={local.height ?? (responsive() ? undefined : (size() as number))}
      style={mergeStyles(getCssSizeVars(size()), local.style, local.sx)}
    />
  )
}

export default Avatar
