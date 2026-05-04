import type { ValidComponent } from 'solid-js'
import { ButtonBase } from './ButtonBase'
import type { LinkButtonProps } from './types'

export function LinkButton<As extends ValidComponent = 'a'>(
  props: LinkButtonProps<As>,
) {
  return <ButtonBase as="a" data-component="LinkButton" {...props} />
}

LinkButton.displayName = 'LinkButton'

export default LinkButton
