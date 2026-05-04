import {
  RelativeTimeElement,
  type RelativeTimeUpdatedEvent,
} from '@github/relative-time-element'
import { createEffect, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'

type Ref<T> = ((element: T) => void) | { current?: T | null } | undefined

type RelativeTimeOwnProps = {
  children?: JSX.Element
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  date?: Date
  datetime?: string
  format?: RelativeTimeElement['format']
  formatStyle?: RelativeTimeElement['formatStyle']
  tense?: RelativeTimeElement['tense']
  precision?: RelativeTimeElement['precision']
  threshold?: RelativeTimeElement['threshold']
  prefix?: RelativeTimeElement['prefix']
  second?: RelativeTimeElement['second']
  minute?: RelativeTimeElement['minute']
  hour?: RelativeTimeElement['hour']
  weekday?: RelativeTimeElement['weekday']
  day?: RelativeTimeElement['day']
  month?: RelativeTimeElement['month']
  year?: RelativeTimeElement['year']
  timeZoneName?: RelativeTimeElement['timeZoneName']
  noTitle?: boolean
  onRelativeTimeUpdated?: ((event: RelativeTimeUpdatedEvent) => void) | null
  ref?: Ref<RelativeTimeElement>
}

export type RelativeTimeProps = Omit<
  JSX.HTMLAttributes<RelativeTimeElement>,
  keyof RelativeTimeOwnProps | 'ref'
> &
  RelativeTimeOwnProps

const localeOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

function assignRef<T>(ref: Ref<T>, element: T) {
  if (typeof ref === 'function') {
    ref(element)
  } else if (ref) {
    ref.current = element
  }
}

function getResolvedDate(date?: Date, datetime?: string) {
  if (datetime) return new Date(datetime)
  return date
}

export function RelativeTime(props: RelativeTimeProps) {
  let element: RelativeTimeElement | undefined
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'date',
    'datetime',
    'format',
    'formatStyle',
    'tense',
    'precision',
    'threshold',
    'prefix',
    'second',
    'minute',
    'hour',
    'weekday',
    'day',
    'month',
    'year',
    'timeZoneName',
    'noTitle',
    'onRelativeTimeUpdated',
    'ref',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  createEffect(() => {
    if (!element) return
    element.onRelativeTimeUpdated = local.onRelativeTimeUpdated ?? null
    element.toggleAttribute('no-title', !!local.noTitle)
  })

  const resolvedDate = () => getResolvedDate(local.date, local.datetime)
  const fallbackText = () =>
    resolvedDate()?.toLocaleDateString('en', localeOptions) || ''

  return (
    <Component
      component="relative-time"
      {...rest}
      ref={(value: unknown) => {
        if (value instanceof RelativeTimeElement) {
          element = value
          assignRef(local.ref, value)
        }
      }}
      class={mergeClassNames(local.className, local.class)}
      datetime={resolvedDate()?.toISOString()}
      format={local.format}
      format-style={local.formatStyle}
      tense={local.tense}
      precision={local.precision}
      threshold={local.threshold}
      prefix={local.prefix}
      second={local.second}
      minute={local.minute}
      hour={local.hour}
      weekday={local.weekday}
      day={local.day}
      month={local.month}
      year={local.year}
      time-zone-name={local.timeZoneName}
      no-title={local.noTitle ? '' : undefined}
    >
      {local.children || fallbackText()}
    </Component>
  )
}

export default RelativeTime
