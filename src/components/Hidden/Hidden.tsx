import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames, mergeStyles, type ResponsiveValue } from '../../utils'
import styles from './Hidden.module.css'

type Viewport = 'narrow' | 'regular' | 'wide'

export type HiddenProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> & {
  when: Array<Viewport> | Viewport
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

function normalize(hiddenViewports: Array<Viewport> | Viewport): ResponsiveValue<boolean> {
  if (Array.isArray(hiddenViewports)) {
    const breakpoints: ResponsiveValue<boolean> = {}

    for (const breakpoint of hiddenViewports) {
      breakpoints[breakpoint] = true
    }

    return breakpoints
  }

  return {
    [hiddenViewports]: true,
  }
}

function getHiddenStyles(when: HiddenProps['when']) {
  const normalized = normalize(when)

  return {
    '--hiddenDisplay-narrow': normalized.narrow ? 'none' : undefined,
    '--hiddenDisplay-regular': normalized.regular ? 'none' : undefined,
    '--hiddenDisplay-wide': normalized.wide ? 'none' : undefined,
  } as JSX.CSSProperties
}

export function Hidden(props: HiddenProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'style',
    'when',
  ])

  return (
    <div
      {...rest}
      class={mergeClassNames(styles.Hidden, local.className, local.class)}
      style={mergeStyles(getHiddenStyles(local.when), local.style)}
    >
      {local.children}
    </div>
  )
}

export default Hidden
