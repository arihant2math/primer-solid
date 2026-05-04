import { createUniqueId, type ValidComponent } from 'solid-js'
import { mergeClassNames } from '../../utils'
import { VisuallyHidden } from '../VisuallyHidden'
import { ButtonBase } from './ButtonBase'
import styles from './ButtonBase.module.css'
import type { IconButtonProps, TooltipDirection } from './types'

function joinIds(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined
}

function formatKeybindingHint(hint: string | string[] | undefined) {
  if (!hint) return undefined

  const hints = (Array.isArray(hint) ? hint : [hint]).filter(Boolean)

  return hints.length > 0 ? hints.join(' or ') : undefined
}

function getTooltipText(
  text: string,
  keybindingHint: string | string[] | undefined,
) {
  const formattedHint = formatKeybindingHint(keybindingHint)

  return formattedHint ? `${text} (${formattedHint})` : text
}

type RuntimeIconButtonProps<As extends ValidComponent> = IconButtonProps<As> & {
  'aria-describedby'?: string
  'aria-expanded'?: boolean | 'true' | 'false'
  'aria-haspopup'?: boolean | 'true' | 'false' | string
  'aria-label'?: string
  'aria-labelledby'?: string
  class?: string
  className?: string
  description?: string
  disabled?: boolean
  id?: string
  keybindingHint?: string | string[]
  keyshortcuts?: string
  ref?: IconButtonProps<As>['ref']
  tooltipDirection?: TooltipDirection
  unsafeDisableTooltip?: boolean
}

export function IconButton<As extends ValidComponent = 'button'>(
  props: IconButtonProps<As>,
) {
  const {
    'aria-describedby': ariaDescribedBy,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    class: classNameSolid,
    className,
    description,
    disabled,
    icon,
    id,
    keybindingHint,
    keyshortcuts,
    ref,
    tooltipDirection,
    unsafeDisableTooltip,
    ...rest
  } = props as RuntimeIconButtonProps<As>

  const generatedId = createUniqueId()
  const tooltipId = () => `${id ?? generatedId}-tooltip`
  const tooltipText = () =>
    getTooltipText(description ?? ariaLabel ?? '', keybindingHint ?? keyshortcuts)

  const hasActivePopup =
    (ariaExpanded === true || ariaExpanded === 'true') && ariaHasPopup === 'true'

  const withoutTooltip =
    unsafeDisableTooltip ||
    disabled ||
    ariaLabel === undefined ||
    ariaLabel === '' ||
    hasActivePopup

  if (withoutTooltip) {
    return (
      <ButtonBase
        icon={icon}
        className={mergeClassNames(className, styles.IconButton)}
        class={classNameSolid}
        data-component="IconButton"
        type="button"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        disabled={disabled}
        {...(rest as Record<string, unknown>)}
        ref={ref}
      />
    )
  }

  return (
    <span class={styles.IconButtonTooltipWrapper}>
      <ButtonBase
        icon={icon}
        className={mergeClassNames(className, styles.IconButton)}
        class={classNameSolid}
        data-component="IconButton"
        type="button"
        aria-keyshortcuts={keyshortcuts ?? undefined}
        aria-describedby={
          description ? joinIds(ariaDescribedBy, tooltipId()) : ariaDescribedBy
        }
        aria-labelledby={description ? undefined : tooltipId()}
        aria-label={description ? ariaLabel : undefined}
        disabled={disabled}
        {...(rest as Record<string, unknown>)}
        ref={ref}
      />
      <span
        aria-hidden="true"
        class={styles.IconButtonTooltip}
        data-direction={tooltipDirection ?? 's'}
      >
        {tooltipText()}
      </span>
      <VisuallyHidden id={tooltipId()}>{tooltipText()}</VisuallyHidden>
    </span>
  )
}

IconButton.displayName = 'IconButton'
;(IconButton as typeof IconButton & { __SLOT__?: symbol }).__SLOT__ =
  Symbol('IconButton')

export default IconButton
