import { splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { mergeClassNames } from '../../utils'
import { octicons } from './octicons'
import type { OcticonName } from './octicons'

type Ref<T> = ((element: T) => void) | { current?: T | null } | undefined

type OcticonBaseProps = Omit<
  JSX.SvgSVGAttributes<SVGSVGElement>,
  'children' | 'className' | 'height' | 'innerHTML' | 'viewBox' | 'width'
> & {
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  /** @deprecated Use `name` instead. */
  icon?: OcticonName
  label?: string
  size?: number
  width?: number
  height?: number
  stroke?: string
  fill?: string
  ref?: Ref<SVGSVGElement>
}

export type OcticonProps =
  | (OcticonBaseProps & {
      name: OcticonName
      icon?: OcticonName
    })
  | (OcticonBaseProps & {
      name?: OcticonName
      icon: OcticonName
    })

const DEFAULT_HEIGHT = 16

function assignRef<T>(ref: Ref<T>, element: T) {
  if (typeof ref === 'function') {
    ref(element)
  } else if (ref) {
    ref.current = element
  }
}

function closestNaturalHeight(
  naturalHeights: string[],
  requestedHeight: number,
) {
  return naturalHeights
    .map((height) => Number.parseInt(height, 10))
    .reduce(
      (bestHeight, naturalHeight) =>
        naturalHeight <= requestedHeight ? naturalHeight : bestHeight,
      Number.parseInt(naturalHeights[0] ?? `${DEFAULT_HEIGHT}`, 10),
    )
}

export function Octicon(props: OcticonProps) {
  const [local, svgProps] = splitProps(props, [
    'aria-label',
    'aria-hidden',
    'class',
    'className',
    'fill',
    'height',
    'icon',
    'label',
    'name',
    'ref',
    'role',
    'size',
    'stroke',
    'width',
  ])

  const name = () => (local.name ?? local.icon)!
  const icon = () => octicons[name()]
  const requestedDimension = () =>
    local.height ?? local.width ?? local.size ?? DEFAULT_HEIGHT
  const naturalHeight = () =>
    closestNaturalHeight(Object.keys(icon().heights), requestedDimension())
  const naturalIcon = () => icon().heights[naturalHeight()]
  const height = () =>
    local.height ??
    (local.width
      ? (local.width * naturalHeight()) / naturalIcon().width
      : local.size ?? naturalHeight())
  const width = () =>
    local.width ??
    (local.height || local.size
      ? (height() * naturalIcon().width) / naturalHeight()
      : naturalIcon().width)
  const label = () => local.label ?? local['aria-label']

  return (
    <svg
      {...svgProps}
      ref={(element) => assignRef(local.ref, element)}
      version="1.1"
      width={width()}
      height={height()}
      viewBox={`0 0 ${naturalIcon().width} ${naturalHeight()}`}
      class={mergeClassNames(
        `octicon octicon-${String(name())}`,
        local.className,
        local.class,
      )}
      aria-label={label()}
      aria-hidden={label() ? undefined : (local['aria-hidden'] ?? 'true')}
      role={label() ? (local.role ?? 'img') : local.role}
      data-component="Octicon"
      stroke={local.stroke}
      fill={local.fill}
      innerHTML={naturalIcon().path}
    />
  )
}

Octicon.displayName = 'Octicon'

export default Octicon
