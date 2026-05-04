import { splitProps } from 'solid-js'
import type { ComponentProps, JSX, ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import { TopicTagGroup } from './TopicTagGroup'
import type { TopicTagGroupProps } from './TopicTagGroup'
import styles from './TopicTag.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type TopicTagOwnProps<As extends ValidComponent> = {
  /**
   * The HTML element or React component to render as the root element
   */
  as?: As
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

export type TopicTagProps<As extends ValidComponent = 'a'> = DistributiveOmit<
  ComponentProps<As>,
  keyof TopicTagOwnProps<As>
> &
  TopicTagOwnProps<As>

function TopicTagRoot<As extends ValidComponent = 'a'>(
  props: TopicTagProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
  ])

  return (
    <Dynamic
      component={(local.as ?? 'a') as ValidComponent}
      {...rest}
      class={mergeClassNames(local.className, local.class, styles.TopicTag)}
    >
      {local.children}
    </Dynamic>
  )
}

TopicTagRoot.displayName = 'TopicTag'

export const TopicTag = Object.assign(TopicTagRoot, {
  Group: TopicTagGroup,
})

export type { TopicTagGroupProps }
export default TopicTag
