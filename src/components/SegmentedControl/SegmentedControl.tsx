import {
  createContext,
  createMemo,
  createRenderEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  type JSX,
  type ValidComponent,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useOnEscapePress, useOnOutsideClick } from '../../hooks'
import { mergeClassNames, mergeStyles, type ResponsiveValue } from '../../utils'
import { getResponsiveAttributes } from '../../utils/responsive'
import { assignRef, callEventHandler, type RefProp } from '../../utils/solid'
import { Button, type ButtonVisual, type TooltipDirection } from '../Button'
import { CounterLabel } from '../CounterLabel'
import { CheckIcon, TriangleDownIcon } from '../Octicon'
import { VisuallyHidden } from '../VisuallyHidden'
import styles from './SegmentedControl.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type WidthOnlyViewportRangeKeys = 'narrow' | 'regular' | 'wide'
type SegmentedControlVariant =
  | 'default'
  | Partial<
      Record<WidthOnlyViewportRangeKeys, 'hideLabels' | 'dropdown' | 'default'>
    >

type SegmentedControlOwnProps = {
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<HTMLUListElement>
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  fullWidth?: boolean | ResponsiveValue<boolean>
  onChange?: (selectedIndex: number) => void
  size?: 'small' | 'medium'
  variant?: SegmentedControlVariant
}

export type SegmentedControlProps = DistributiveOmit<
  JSX.HTMLAttributes<HTMLUListElement>,
  keyof SegmentedControlOwnProps | 'onChange'
> &
  SegmentedControlOwnProps

type SegmentedControlButtonOwnProps = {
  children: string
  class?: string
  className?: string
  ref?: RefProp<HTMLButtonElement>
  selected?: boolean
  defaultSelected?: boolean
  leadingVisual?: ButtonVisual
  /** @deprecated Use `leadingVisual` instead. */
  leadingIcon?: ButtonVisual
  disabled?: boolean
  count?: number | string
}

export type SegmentedControlButtonProps = DistributiveOmit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  keyof SegmentedControlButtonOwnProps | 'children' | 'className'
> &
  SegmentedControlButtonOwnProps

type SegmentedControlIconButtonOwnProps = {
  class?: string
  className?: string
  ref?: RefProp<HTMLButtonElement>
  'aria-label': string
  icon: NonNullable<ButtonVisual>
  selected?: boolean
  defaultSelected?: boolean
  description?: string
  tooltipDirection?: TooltipDirection
  disabled?: boolean
}

export type SegmentedControlIconButtonProps = DistributiveOmit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  keyof SegmentedControlIconButtonOwnProps | 'className'
> &
  SegmentedControlIconButtonOwnProps

type RegisteredSegment =
  | {
      id: string
      kind: 'button'
      props: SegmentedControlButtonProps
    }
  | {
      id: string
      kind: 'icon-button'
      props: SegmentedControlIconButtonProps
    }

type SegmentedControlContextValue = {
  upsert: (segment: RegisteredSegment) => void
  remove: (id: string) => void
}

const SegmentedControlContext = createContext<SegmentedControlContextValue>()

function renderVisual(visual: ButtonVisual) {
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  if (typeof visual === 'function') {
    return <Component component={visual as ValidComponent} />
  }

  return visual as JSX.Element
}

function isSegmentDisabled(
  props:
    | SegmentedControlButtonProps
    | SegmentedControlIconButtonProps
    | undefined,
) {
  if (!props) return false

  return (
    props.disabled === true ||
    props['aria-disabled'] === true ||
    props['aria-disabled'] === 'true'
  )
}

function joinIds(...ids: Array<string | undefined>) {
  return ids.filter(Boolean).join(' ') || undefined
}

function getSelectedIndexExternal(items: Array<RegisteredSegment>) {
  const selectedSegments = items.map((item) =>
    Boolean(item.props.defaultSelected || item.props.selected),
  )
  const selectedIndex = selectedSegments.indexOf(true)

  return selectedIndex >= 0 ? selectedIndex : 0
}

function getSegmentText(segment: RegisteredSegment | undefined) {
  if (!segment) return undefined

  return segment.kind === 'button'
    ? segment.props.children
    : segment.props['aria-label']
}

function getSegmentIcon(segment: RegisteredSegment | undefined) {
  if (!segment) return undefined

  if (segment.kind === 'button') {
    const leadingVisual =
      segment.props.leadingVisual ?? segment.props.leadingIcon
    return leadingVisual ? renderVisual(leadingVisual) : undefined
  }

  return renderVisual(segment.props.icon)
}

function SegmentedControlButtonView(props: SegmentedControlButtonProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'count',
    'defaultSelected',
    'disabled',
    'leadingIcon',
    'leadingVisual',
    'ref',
    'selected',
  ])
  const leadingVisual = () => local.leadingVisual ?? local.leadingIcon

  return (
    <li class={styles.Item} data-selected={local.selected ? '' : undefined}>
      <button
        aria-current={local.selected}
        aria-disabled={local.disabled || rest['aria-disabled'] || undefined}
        class={mergeClassNames(styles.Button, local.className, local.class)}
        type="button"
        {...(rest as Record<string, unknown>)}
        ref={(element) => {
          assignRef(local.ref, element)
        }}
      >
        <span
          class={mergeClassNames(styles.Content, 'segmentedControl-content')}
        >
          {leadingVisual() ? (
            <div class={styles.LeadingIcon}>
              {renderVisual(leadingVisual()!)}
            </div>
          ) : null}
          <div
            class={mergeClassNames(styles.Text, 'segmentedControl-text')}
            data-text={local.children}
          >
            {local.children}
          </div>
          {local.count !== undefined ? (
            <span class={styles.Counter}>
              <CounterLabel>{local.count}</CounterLabel>
            </span>
          ) : null}
        </span>
      </button>
    </li>
  )
}

function SegmentedControlIconButtonView(
  props: SegmentedControlIconButtonProps,
) {
  const generatedId = createUniqueId()
  const [local, rest] = splitProps(props, [
    'aria-label',
    'class',
    'className',
    'defaultSelected',
    'description',
    'disabled',
    'icon',
    'ref',
    'selected',
    'tooltipDirection',
  ])
  const tooltipId = () =>
    `${(rest.id as string | undefined) ?? generatedId}-tooltip`
  const tooltipText = () => local.description ?? local['aria-label']

  return (
    <li
      class={mergeClassNames(styles.Item, local.className, local.class)}
      data-selected={local.selected ? '' : undefined}
    >
      <span class={styles.TooltipWrapper}>
        <button
          type="button"
          aria-current={local.selected}
          aria-labelledby={local.description ? undefined : tooltipId()}
          aria-describedby={
            local.description
              ? joinIds(
                  rest['aria-describedby'] as string | undefined,
                  tooltipId(),
                )
              : (rest['aria-describedby'] as string | undefined)
          }
          aria-label={local.description ? local['aria-label'] : undefined}
          aria-disabled={local.disabled || rest['aria-disabled'] || undefined}
          class={mergeClassNames(styles.Button, styles.IconButton)}
          {...(rest as Record<string, unknown>)}
          ref={(element) => {
            assignRef(local.ref, element)
          }}
        >
          <span
            class={mergeClassNames(styles.Content, 'segmentedControl-content')}
          >
            {renderVisual(local.icon)}
          </span>
        </button>
        <span
          aria-hidden="true"
          class={styles.Tooltip}
          data-direction={local.tooltipDirection ?? 's'}
        >
          {tooltipText()}
        </span>
        <VisuallyHidden id={tooltipId()}>{tooltipText()}</VisuallyHidden>
      </span>
    </li>
  )
}

function SegmentedControlButton(props: SegmentedControlButtonProps) {
  const context = useContext(SegmentedControlContext)

  if (!context) {
    return <SegmentedControlButtonView {...props} />
  }

  const id = createUniqueId()

  createRenderEffect(() => {
    context.upsert({
      id,
      kind: 'button',
      props,
    })
  })

  onCleanup(() => {
    context.remove(id)
  })

  return null
}

function SegmentedControlIconButton(props: SegmentedControlIconButtonProps) {
  const context = useContext(SegmentedControlContext)

  if (!context) {
    return <SegmentedControlIconButtonView {...props} />
  }

  const id = createUniqueId()

  createRenderEffect(() => {
    context.upsert({
      id,
      kind: 'icon-button',
      props,
    })
  })

  onCleanup(() => {
    context.remove(id)
  })

  return null
}

function SegmentedControlRoot(props: SegmentedControlProps) {
  let segmentedControlRef: HTMLUListElement | undefined
  let dropdownButtonRef: HTMLButtonElement | undefined
  let dropdownMenuRef: HTMLElement | undefined

  const menuId = createUniqueId()
  const [registeredItems, setRegisteredItems] = createSignal<
    Array<RegisteredSegment>
  >([])
  const [selectedIndexInternal, setSelectedIndexInternal] = createSignal(0)
  const [menuOpen, setMenuOpen] = createSignal(false)
  const [local, rest] = splitProps(props, [
    'aria-describedby',
    'aria-label',
    'aria-labelledby',
    'children',
    'class',
    'className',
    'fullWidth',
    'onChange',
    'ref',
    'size',
    'variant',
  ])

  const contextValue: SegmentedControlContextValue = {
    upsert: (segment) => {
      setRegisteredItems((current) => {
        const index = current.findIndex((item) => item.id === segment.id)
        if (index === -1) return [...current, segment]

        const next = current.slice()
        next[index] = segment
        return next
      })
    },
    remove: (id) => {
      setRegisteredItems((current) => current.filter((item) => item.id !== id))
    },
  }

  let initializedSelection = false

  const selectedIndexExternal = createMemo(() =>
    getSelectedIndexExternal(registeredItems()),
  )
  const isUncontrolled = createMemo(
    () =>
      local.onChange === undefined ||
      registeredItems().some(
        (item) => item.props.defaultSelected !== undefined,
      ),
  )
  const selectedIndex = createMemo(() =>
    isUncontrolled() ? selectedIndexInternal() : selectedIndexExternal(),
  )
  const selectedChild = createMemo(
    () => registeredItems()[selectedIndex()] ?? registeredItems()[0],
  )
  const hasDropdownVariant = createMemo(() => {
    const variant = local.variant ?? 'default'

    if (typeof variant !== 'object' || variant === null) return false

    return Object.values(variant).includes('dropdown')
  })

  createRenderEffect(() => {
    const items = registeredItems()
    const nextSelectedIndex = selectedIndexExternal()

    if (!initializedSelection && items.length > 0) {
      setSelectedIndexInternal(nextSelectedIndex)
      initializedSelection = true
      return
    }

    if (items.length === 0) {
      initializedSelection = false
      setSelectedIndexInternal(0)
      return
    }

    if (selectedIndexInternal() >= items.length) {
      setSelectedIndexInternal(Math.max(0, items.length - 1))
    }
  })

  createRenderEffect(() => {
    if (!local['aria-label'] && !local['aria-labelledby']) {
      console.warn(
        'Use the `aria-label` or `aria-labelledby` prop to provide an accessible label for assistive technologies',
      )
    }
  })

  createRenderEffect(() => {
    if (registeredItems().length === 0 && menuOpen()) {
      setMenuOpen(false)
    }
  })

  useOnEscapePress((event) => {
    if (!menuOpen()) return
    event.preventDefault()
    setMenuOpen(false)
    dropdownButtonRef?.focus()
  })

  useOnOutsideClick({
    containerRef: () => dropdownMenuRef,
    ignoreClickRefs: [() => dropdownButtonRef],
    onClickOutside: () => {
      if (menuOpen()) setMenuOpen(false)
    },
  })

  const handleSegmentSelection = (
    item: RegisteredSegment,
    index: number,
    event: MouseEvent,
  ) => {
    if (isSegmentDisabled(item.props)) return

    if (local.onChange) {
      local.onChange(index)
    }

    if (isUncontrolled()) {
      setSelectedIndexInternal(index)
    }

    callEventHandler(
      item.props.onClick,
      event as MouseEvent & {
        currentTarget: HTMLButtonElement
        target: HTMLButtonElement
      },
    )
  }

  const renderSegment = (item: RegisteredSegment, index: number) => {
    const sharedProps = {
      onClick: (event: MouseEvent) => {
        handleSegmentSelection(item, index, event)
      },
      selected: index === selectedIndex(),
      style: mergeStyles(
        {
          '--separator-color':
            index === selectedIndex() || index === selectedIndex() - 1
              ? 'transparent'
              : 'var(--borderColor-default)',
        } as JSX.CSSProperties,
        item.props.style as JSX.CSSProperties | string | undefined,
      ),
    }

    if (item.kind === 'button') {
      return <SegmentedControlButtonView {...item.props} {...sharedProps} />
    }

    return <SegmentedControlIconButtonView {...item.props} {...sharedProps} />
  }

  return (
    <>
      <div hidden aria-hidden="true">
        <SegmentedControlContext.Provider value={contextValue}>
          {local.children}
        </SegmentedControlContext.Provider>
      </div>

      {hasDropdownVariant() ? (
        <div
          class={styles.DropdownContainer}
          {...getResponsiveAttributes('variant', local.variant ?? 'default')}
        >
          <div class={styles.Dropdown}>
            <Button
              ref={(element) => {
                dropdownButtonRef = element as HTMLButtonElement
              }}
              aria-controls={menuId}
              aria-expanded={menuOpen()}
              aria-haspopup="true"
              aria-label={
                local['aria-label'] && getSegmentText(selectedChild())
                  ? `${getSegmentText(selectedChild())}, ${local['aria-label']}`
                  : undefined
              }
              className={styles.DropdownButton}
              leadingVisual={getSegmentIcon(selectedChild())}
              onClick={() => {
                setMenuOpen((open) => !open)
              }}
              size={local.size ?? 'medium'}
              trailingAction={<TriangleDownIcon />}
            >
              {getSegmentText(selectedChild())}
            </Button>
            {menuOpen() ? (
              <div
                id={menuId}
                ref={(element) => {
                  dropdownMenuRef = element
                }}
                class={styles.DropdownMenu}
              >
                <ul
                  role="menu"
                  aria-label={local['aria-label']}
                  aria-labelledby={local['aria-labelledby']}
                  aria-describedby={local['aria-describedby']}
                  class={styles.DropdownMenuList}
                >
                  {registeredItems().map((item, index) => (
                    <li class={styles.DropdownMenuItem}>
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={index === selectedIndex()}
                        aria-disabled={
                          isSegmentDisabled(item.props) ? 'true' : undefined
                        }
                        class={styles.DropdownMenuButton}
                        onClick={(event) => {
                          if (isSegmentDisabled(item.props)) return
                          handleSegmentSelection(item, index, event)
                          setMenuOpen(false)
                          dropdownButtonRef?.focus()
                        }}
                      >
                        <span class={styles.DropdownMenuButtonContent}>
                          {getSegmentIcon(item) ? (
                            <span class={styles.DropdownMenuItemIcon}>
                              {getSegmentIcon(item)}
                            </span>
                          ) : null}
                          <span class={styles.DropdownMenuItemText}>
                            {getSegmentText(item)}
                          </span>
                        </span>
                        <span class={styles.DropdownMenuCheck}>
                          {index === selectedIndex() ? <CheckIcon /> : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <ul
        aria-label={local['aria-label']}
        aria-labelledby={local['aria-labelledby']}
        aria-describedby={local['aria-describedby']}
        {...(rest as Record<string, unknown>)}
        ref={(element) => {
          segmentedControlRef = element
          assignRef(local.ref, element)
        }}
        class={mergeClassNames(
          styles.SegmentedControl,
          local.className,
          local.class,
        )}
        {...getResponsiveAttributes('full-width', local.fullWidth)}
        {...getResponsiveAttributes('variant', local.variant ?? 'default')}
        data-component="SegmentedControl"
        data-size={local.size}
      >
        {registeredItems().map((item, index) => renderSegment(item, index))}
      </ul>
    </>
  )
}

SegmentedControlRoot.displayName = 'SegmentedControl'
SegmentedControlButton.displayName = 'SegmentedControl.Button'
SegmentedControlIconButton.displayName = 'SegmentedControl.IconButton'

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Button: SegmentedControlButton,
  IconButton: SegmentedControlIconButton,
})

export default SegmentedControl
