import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames } from '../../utils'
import styles from './TopicTagGroup.module.css'

export type TopicTagGroupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'className'
> & {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

export function TopicTagGroup(props: TopicTagGroupProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className'])

  return (
    <div
      {...rest}
      class={mergeClassNames(
        local.className,
        local.class,
        styles.TopicTagGroup,
      )}
    >
      {local.children}
    </div>
  )
}

TopicTagGroup.displayName = 'TopicTag.Group'
