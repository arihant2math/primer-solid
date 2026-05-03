import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames } from '../../utils'
import styles from './Timeline.module.css'

type TimelineClipSidebar = boolean | 'start' | 'end' | 'both'

type StyledTimelineProps = {
  clipSidebar?: TimelineClipSidebar
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

export type TimelineProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'className'
> &
  StyledTimelineProps

function resolveClipSidebar(
  clipSidebar: TimelineProps['clipSidebar'],
): string | undefined {
  if (clipSidebar === true || clipSidebar === 'both') return 'both'
  if (clipSidebar === 'start' || clipSidebar === 'end') return clipSidebar
  return undefined
}

function TimelineRoot(props: TimelineProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'clipSidebar',
  ])

  return (
    <div
      {...rest}
      class={mergeClassNames(local.className, local.class, styles.Timeline)}
      data-clip-sidebar={resolveClipSidebar(local.clipSidebar)}
    >
      {local.children}
    </div>
  )
}

TimelineRoot.displayName = 'Timeline'

type StyledTimelineItemProps = {
  condensed?: boolean
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

/**
 * @deprecated Use the `TimelineItemProps` type instead
 */
export type TimelineItemsProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'className'
> &
  StyledTimelineItemProps

export type TimelineItemProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'className'
> &
  StyledTimelineItemProps

function TimelineItem(props: TimelineItemProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'condensed',
  ])

  return (
    <div
      {...rest}
      class={mergeClassNames(
        local.className,
        local.class,
        'Timeline-Item',
        styles.TimelineItem,
      )}
      data-condensed={local.condensed ? '' : undefined}
    >
      {local.children}
    </div>
  )
}

TimelineItem.displayName = 'TimelineItem'

export type TimelineBadgeVariant =
  | 'accent'
  | 'success'
  | 'attention'
  | 'severe'
  | 'danger'
  | 'done'
  | 'open'
  | 'closed'
  | 'sponsors'

export type TimelineBadgeProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'className'
> & {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  /** The color variant of the badge */
  variant?: TimelineBadgeVariant
}

function TimelineBadge(props: TimelineBadgeProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'variant',
  ])

  return (
    <div class={styles.TimelineBadgeWrapper}>
      <div
        {...rest}
        class={mergeClassNames(
          local.className,
          local.class,
          styles.TimelineBadge,
        )}
        data-variant={local.variant}
      >
        {local.children}
      </div>
    </div>
  )
}

TimelineBadge.displayName = 'Timeline.Badge'

export type TimelineBodyProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'className'
> & {
  /** Class name for custom styling */
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

function TimelineBody(props: TimelineBodyProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className'])

  return (
    <div
      {...rest}
      class={mergeClassNames(local.className, local.class, styles.TimelineBody)}
    >
      {local.children}
    </div>
  )
}

TimelineBody.displayName = 'TimelineBody'

export type TimelineBreakProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'className'
> & {
  /** Class name for custom styling */
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
}

function TimelineBreak(props: TimelineBreakProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className'])

  return (
    <div
      {...rest}
      class={mergeClassNames(local.className, local.class, styles.TimelineBreak)}
    >
      {local.children}
    </div>
  )
}

TimelineBreak.displayName = 'TimelineBreak'

export const Timeline = Object.assign(TimelineRoot, {
  Item: TimelineItem,
  Badge: TimelineBadge,
  Body: TimelineBody,
  Break: TimelineBreak,
})

export default Timeline
