import type { ValidComponent } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { iconComponents } from './icons'
import type { Icon, IconProps } from './icons'
import type { OcticonName } from './octicons'

export type OcticonProps = IconProps & {
  /** @deprecated Use the icon component directly instead. */
  icon?: Icon | OcticonName
  /** @deprecated Use the icon component directly instead. */
  name?: OcticonName
  /** React compatibility prop. Ignored. */
  as?: ValidComponent
}

export function Octicon(props: OcticonProps) {
  const IconComponent =
    typeof props.icon === 'string'
      ? iconComponents[props.icon]
      : (props.icon ?? (props.name ? iconComponents[props.name] : undefined))

  if (!IconComponent) return null

  const { as: _as, icon: _icon, name: _name, ...rest } = props

  return <Dynamic component={IconComponent} {...rest} />
}

Octicon.displayName = 'Octicon'

export default Octicon
