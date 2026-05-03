import {
  Show,
  children as resolveChildren,
  createContext,
  createMemo,
  createUniqueId,
  splitProps,
  useContext,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames, mergeStyles } from '../../utils'
import { assignRef, callEventHandler, type RefProp } from '../../utils/solid'
import { ButtonBase } from '../Button'
import { Heading as PrimerHeading } from '../Heading'
import { Link } from '../Link'
import { Spinner } from '../Spinner'
import { VisuallyHidden } from '../VisuallyHidden'
import groupStyles from './Group.module.css'
import headingStyles from './Heading.module.css'
import styles from './ActionList.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
type HeadingSize = 'large' | 'medium' | 'small'
type ActionListVariant = 'inset' | 'horizontal-inset' | 'full'
type ActionListSelectionVariant = 'single' | 'radio' | 'multiple'
type ActionListItemVariant = 'default' | 'danger'
type ActionListItemSize = 'medium' | 'large'
type SelectionAttribute = 'aria-selected' | 'aria-checked'

type ActionListContainerContextValue = {
  container?: string
  listRole?: string
  selectionVariant?: ActionListSelectionVariant
  selectionAttribute?: SelectionAttribute
  listLabelledBy?: string
  afterSelect?: (event: MouseEvent | KeyboardEvent) => void
  enableFocusZone?: boolean
  defaultTrailingVisual?: JSX.Element
}

const ActionListContainerContext =
  createContext<ActionListContainerContextValue>({})

type ListContextValue = {
  variant: ActionListVariant
  selectionVariant?: ActionListSelectionVariant
  showDividers: boolean
  role?: string
  headingId: string
}

const ListContext = createContext<ListContextValue>({
  variant: 'inset',
  showDividers: false,
  headingId: '',
})

type GroupContextValue = {
  selectionVariant?: ActionListSelectionVariant | false
  groupHeadingId?: string
}

const GroupContext = createContext<GroupContextValue>({})

type ActionListOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<unknown>
  variant?: ActionListVariant
  selectionVariant?: ActionListSelectionVariant
  showDividers?: boolean
  role?: string
  disableFocusZone?: boolean
}

export type ActionListProps<As extends ValidComponent = 'ul'> =
  DistributiveOmit<ComponentProps<As>, keyof ActionListOwnProps<As>> &
    ActionListOwnProps<As>

type ItemWrapperRenderProps = {
  children?: JSX.Element
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  onKeyPress?: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent>
  'aria-disabled'?: boolean
  tabIndex?: number
  'aria-labelledby'?: string
  'aria-describedby'?: string
  role?: string
  class?: string
  className?: string
  id?: string
  title?: string
}

export type ActionListItemProps = Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'className' | 'onSelect' | 'ref' | 'role'
> & {
  children?: JSX.Element
  onSelect?: (event: MouseEvent | KeyboardEvent) => void
  selected?: boolean
  active?: boolean
  variant?: ActionListItemVariant
  size?: ActionListItemSize
  disabled?: boolean
  role?: string
  id?: string
  inactiveText?: string
  loading?: boolean
  class?: string
  className?: string
  /** @deprecated `as` has no effect on `ActionList.Item`. */
  as?: ValidComponent
  ref?: RefProp<unknown>
  _PrivateItemWrapper?: (props: ItemWrapperRenderProps) => JSX.Element
}

type LinkItemOwnProps<As extends ValidComponent> = {
  as?: As
  active?: boolean
  children?: JSX.Element
  inactiveText?: string
  variant?: ActionListItemVariant
  size?: ActionListItemSize
  class?: string
  className?: string
  ref?: RefProp<unknown>
}

export type ActionListLinkItemProps<As extends ValidComponent = 'a'> =
  DistributiveOmit<ComponentProps<As>, keyof LinkItemOwnProps<As>> &
    LinkItemOwnProps<As>

export type ActionListDividerProps = Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'className'
> & {
  class?: string
  className?: string
}

export type ActionListDescriptionProps = {
  variant?: 'inline' | 'block'
  truncate?: boolean
  children?: JSX.Element
  class?: string
  className?: string
  style?: JSX.CSSProperties
}

type VisualProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'className'> & {
  children?: JSX.Element
  class?: string
  className?: string
}

export type ActionListLeadingVisualProps = VisualProps
export type ActionListTrailingVisualProps = VisualProps

export type ActionListHeadingProps = Omit<
  JSX.HTMLAttributes<HTMLHeadingElement>,
  'children' | 'className'
> & {
  as: HeadingTag
  size?: HeadingSize
  visuallyHidden?: boolean
  children?: JSX.Element
  class?: string
  className?: string
}

export type ActionListGroupProps = Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'className'
> & {
  children?: JSX.Element
  class?: string
  className?: string
  variant?: 'filled' | 'subtle'
  title?: string
  auxiliaryText?: string
  selectionVariant?: ActionListSelectionVariant | false
}

export type ActionListGroupHeadingProps = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  'children' | 'className'
> & {
  as?: HeadingTag
  variant?: 'filled' | 'subtle'
  auxiliaryText?: string
  children?: JSX.Element
  class?: string
  className?: string
  headingWrapElement?: 'div' | 'li'
  _internalBackwardCompatibleTitle?: string
}

type TrailingActionButtonProps = {
  as?: 'button'
  href?: never
  loading?: boolean
}

type TrailingActionLinkProps = {
  as: 'a'
  href: string
  loading?: never
}

export type ActionListTrailingActionProps = (
  | TrailingActionButtonProps
  | TrailingActionLinkProps
) & {
  icon?: ValidComponent
  label: string
  class?: string
  className?: string
  style?: JSX.CSSProperties
  ref?: RefProp<unknown>
} & Omit<
    JSX.ButtonHTMLAttributes<HTMLButtonElement> &
      JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    'children' | 'className' | 'href' | 'ref'
  >

type SlotType =
  | 'heading'
  | 'groupHeading'
  | 'description'
  | 'leadingVisual'
  | 'trailingVisual'
  | 'trailingAction'

const ACTION_LIST_SLOT = Symbol('primer-solid.action-list-slot')

type SlotMarker<T extends SlotType = SlotType> = {
  readonly [ACTION_LIST_SLOT]: true
  type: T
  props: Record<string, unknown>
}

function createSlot<T extends SlotType>(
  type: T,
  props: Record<string, unknown>,
): JSX.Element {
  return {
    [ACTION_LIST_SLOT]: true,
    type,
    props,
  } as SlotMarker<T> as unknown as JSX.Element
}

function isSlot<T extends SlotType>(
  value: unknown,
  type?: T,
): value is SlotMarker<T> {
  if (typeof value !== 'object' || value === null) return false

  const slot = value as Partial<SlotMarker>
  if (slot[ACTION_LIST_SLOT] !== true) return false

  return type ? slot.type === type : true
}

function ActionListCheckIcon(props: { class?: string }) {
  return (
    <svg
      class={props.class}
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path d="M13.78 3.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L2.22 6.28a.75.75 0 1 1 1.06-1.06L7 8.94l5.72-5.72a.75.75 0 0 1 1.06 0Z" />
    </svg>
  )
}

function ActionListAlertIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l5.13 9.604A1.75 1.75 0 0 1 13.13 13.5H2.87a1.75 1.75 0 0 1-1.543-2.849ZM8 4.5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 4.5Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  )
}

function getStringChild(children: unknown) {
  return typeof children === 'string' ? children : undefined
}

function renderVisualSlot(
  slot: SlotMarker<'leadingVisual' | 'trailingVisual'>,
  position: 'leading' | 'trailing',
  trailingVisualId?: string,
) {
  const slotProps = slot.props as VisualProps
  const className =
    position === 'leading' ? styles.LeadingVisual : styles.TrailingVisual

  return (
    <span
      {...slotProps}
      id={position === 'trailing' ? trailingVisualId : slotProps.id}
      class={mergeClassNames(
        styles.VisualWrap,
        className,
        slotProps.className,
        slotProps.class,
      )}
      data-component={
        position === 'leading'
          ? 'ActionList.LeadingVisual'
          : 'ActionList.TrailingVisual'
      }
    >
      {slotProps.children}
    </span>
  )
}

function renderDescriptionSlot(
  slot: SlotMarker<'description'>,
  options: {
    inlineDescriptionId: string
    blockDescriptionId: string
    buttonSemantics: boolean
  },
) {
  const slotProps = slot.props as ActionListDescriptionProps
  const variant = slotProps.variant ?? 'inline'
  const title = getStringChild(slotProps.children)

  if (variant === 'block' || !slotProps.truncate) {
    return (
      <span
        id={
          variant === 'block'
            ? options.blockDescriptionId
            : options.inlineDescriptionId
        }
        class={mergeClassNames(
          styles.Description,
          slotProps.className,
          slotProps.class,
        )}
        style={mergeStyles(slotProps.style)}
        data-component="ActionList.Description"
      >
        {slotProps.children}
      </span>
    )
  }

  return (
    <div
      id={options.inlineDescriptionId}
      class={mergeClassNames(
        styles.Description,
        styles.TruncatedDescription,
        slotProps.className,
        slotProps.class,
      )}
      style={mergeStyles(slotProps.style)}
      title={options.buttonSemantics ? '' : title}
      data-component="ActionList.Description"
      data-truncate="true"
    >
      {slotProps.children}
    </div>
  )
}

function renderSelection(
  selectionVariant: ActionListSelectionVariant | undefined,
  listRole: string | undefined,
  selected: boolean | undefined,
) {
  if (!selectionVariant) {
    if (selected) {
      console.warn(
        'For Item to be selected, ActionList or ActionList.Group should have a selectionVariant defined.',
      )
    }
    return null
  }

  const variant =
    selectionVariant === 'radio'
      ? 'radio'
      : selectionVariant === 'single' || listRole === 'menu'
        ? 'single'
        : 'multiple'

  return (
    <span
      class={mergeClassNames(styles.VisualWrap, styles.LeadingAction)}
      data-component="ActionList.Selection"
      data-selection-variant={variant}
      data-selected={selected ? 'true' : 'false'}
    >
      <Show
        when={variant === 'single'}
        fallback={
          <Show
            when={variant === 'radio'}
            fallback={<span class={styles.MultiSelectCheckbox} />}
          >
            <span class={styles.RadioSelection}>
              <span class={styles.RadioSelectionDot} />
            </span>
          </Show>
        }
      >
        <ActionListCheckIcon class={styles.SingleSelectCheckmark} />
      </Show>
    </span>
  )
}

function renderTrailingAction(slot: SlotMarker<'trailingAction'>) {
  const slotProps = slot.props as ActionListTrailingActionProps
  const [local, rest] = splitProps(slotProps, [
    'as',
    'class',
    'className',
    'href',
    'icon',
    'label',
    'loading',
    'ref',
    'style',
  ])

  return (
    <span
      class={mergeClassNames(
        styles.TrailingAction,
        local.className,
        local.class,
      )}
      style={mergeStyles(local.style)}
      data-component="ActionList.TrailingAction"
    >
      <ButtonBase
        {...(rest as Record<string, unknown>)}
        as={(local.as ?? 'button') as ValidComponent}
        href={local.href as string | undefined}
        type={local.as === 'a' ? undefined : 'button'}
        variant="invisible"
        loading={local.loading}
        icon={local.icon}
        ref={local.ref}
        aria-label={local.label}
        class={styles.TrailingActionButton}
        data-loading={local.loading ? 'true' : undefined}
      >
        {local.icon ? undefined : local.label}
      </ButtonBase>
    </span>
  )
}

function partitionActionListChildren(children: JSX.Element | undefined) {
  const resolved = resolveChildren(() => children)

  return createMemo(() => {
    const heading = undefined as SlotMarker<'heading'> | undefined
    const items: Array<JSX.Element> = []
    let nextHeading = heading

    for (const child of resolved.toArray()) {
      if (isSlot(child, 'heading')) {
        nextHeading ??= child
        continue
      }

      items.push(child)
    }

    return { heading: nextHeading, items }
  })
}

function partitionGroupChildren(children: JSX.Element | undefined) {
  const resolved = resolveChildren(() => children)

  return createMemo(() => {
    let groupHeading: SlotMarker<'groupHeading'> | undefined
    const items: Array<JSX.Element> = []

    for (const child of resolved.toArray()) {
      if (isSlot(child, 'groupHeading')) {
        groupHeading ??= child
        continue
      }

      items.push(child)
    }

    return { groupHeading, items }
  })
}

function partitionItemChildren(children: JSX.Element | undefined) {
  const resolved = resolveChildren(() => children)

  return createMemo(() => {
    let description: SlotMarker<'description'> | undefined
    let leadingVisual: SlotMarker<'leadingVisual'> | undefined
    let trailingAction: SlotMarker<'trailingAction'> | undefined
    let trailingVisual: SlotMarker<'trailingVisual'> | undefined
    const items: Array<JSX.Element> = []

    for (const child of resolved.toArray()) {
      if (isSlot(child, 'description')) {
        description ??= child
        continue
      }

      if (isSlot(child, 'leadingVisual')) {
        leadingVisual ??= child
        continue
      }

      if (isSlot(child, 'trailingVisual')) {
        trailingVisual ??= child
        continue
      }

      if (isSlot(child, 'trailingAction')) {
        trailingAction ??= child
        continue
      }

      items.push(child)
    }

    return { description, items, leadingVisual, trailingAction, trailingVisual }
  })
}

function renderListHeading(
  slot: SlotMarker<'heading'>,
  headingId: string,
  listVariant: ActionListVariant,
  container: string | undefined,
) {
  if (container === 'ActionMenu') {
    throw new Error(
      "ActionList.Heading shouldn't be used within an ActionMenu container. Menus are labelled by the menu button's name.",
    )
  }

  const props = slot.props as ActionListHeadingProps
  const content = (
    <PrimerHeading
      {...props}
      as={props.as}
      size={props.size}
      id={props.id ?? headingId}
      class={mergeClassNames(
        headingStyles.ActionListHeader,
        props.className,
        props.class,
      )}
      data-component="ActionList.Heading"
      data-list-variant={listVariant}
    >
      {props.children}
    </PrimerHeading>
  )

  return props.visuallyHidden ? (
    <VisuallyHidden>{content}</VisuallyHidden>
  ) : (
    content
  )
}

function renderGroupHeading(
  slot: SlotMarker<'groupHeading'>,
  groupHeadingId: string | undefined,
  listRole: string | undefined,
) {
  const props = slot.props as ActionListGroupHeadingProps
  const missingAsForList =
    (listRole === undefined || listRole === 'list') &&
    props.children !== undefined &&
    props.as === undefined
  const unnecessaryAsForListboxOrMenu =
    listRole !== undefined &&
    listRole !== 'list' &&
    props.children !== undefined &&
    props.as !== undefined

  if (missingAsForList) {
    throw new Error(
      "You are setting a heading for a list, that requires a heading level. Please use 'as' prop to set a proper heading level.",
    )
  }

  if (unnecessaryAsForListboxOrMenu) {
    throw new Error(
      `Looks like you are trying to set a heading level to a ${listRole} role. Group headings for ${listRole} type action lists are for representational purposes, and rendered as divs. Therefore they don't need a heading level.`,
    )
  }

  const [local, rest] = splitProps(props, [
    '_internalBackwardCompatibleTitle',
    'as',
    'auxiliaryText',
    'children',
    'class',
    'className',
    'headingWrapElement',
    'ref',
    'variant',
  ])
  const wrapperComponent = () => local.headingWrapElement ?? 'div'
  const content = local._internalBackwardCompatibleTitle ?? local.children

  return (
    <Dynamic
      component={wrapperComponent() as ValidComponent}
      {...(rest as Record<string, unknown>)}
      role={listRole && listRole !== 'list' ? 'presentation' : undefined}
      aria-hidden={listRole && listRole !== 'list' ? 'true' : undefined}
      class={groupStyles.GroupHeadingWrap}
      data-variant={local.variant ?? 'subtle'}
      data-component="GroupHeadingWrap"
    >
      <Show
        when={listRole && listRole !== 'list'}
        fallback={
          <Dynamic
            component={(local.as ?? 'h3') as ValidComponent}
            id={groupHeadingId}
            class={mergeClassNames(
              groupStyles.GroupHeading,
              local.className,
              local.class,
            )}
          >
            {content}
          </Dynamic>
        }
      >
        <span
          id={groupHeadingId}
          class={mergeClassNames(
            groupStyles.GroupHeading,
            local.className,
            local.class,
          )}
        >
          {content}
        </span>
      </Show>
      <Show when={local.auxiliaryText}>
        <div class={styles.Description}>{local.auxiliaryText}</div>
      </Show>
    </Dynamic>
  )
}

function getFocusTargetForItem(item: HTMLElement) {
  if (item.tabIndex >= 0) return item

  return item.querySelector<HTMLElement>(
    'a[href],button,[tabindex]:not([tabindex="-1"])',
  )
}

function handleFocusZoneNavigation(
  event: KeyboardEvent,
  list: HTMLElement,
  wrap: boolean,
) {
  const key = event.key
  if (
    key !== 'ArrowDown' &&
    key !== 'ArrowUp' &&
    key !== 'Home' &&
    key !== 'End' &&
    key !== 'PageDown' &&
    key !== 'PageUp'
  ) {
    return
  }

  const items = Array.from(
    list.querySelectorAll<HTMLElement>('[data-component="ActionList.Item"]'),
  )
    .map((item) => getFocusTargetForItem(item))
    .filter((item): item is HTMLElement => Boolean(item))

  if (items.length === 0) return

  const activeElement = document.activeElement as HTMLElement | null
  const currentIndex = activeElement ? items.indexOf(activeElement) : -1
  let nextIndex = currentIndex >= 0 ? currentIndex : 0

  if (key === 'Home' || key === 'PageUp') nextIndex = 0
  else if (key === 'End' || key === 'PageDown') nextIndex = items.length - 1
  else if (key === 'ArrowDown') nextIndex = currentIndex + 1
  else if (key === 'ArrowUp') nextIndex = currentIndex - 1

  if (wrap) {
    nextIndex = ((nextIndex % items.length) + items.length) % items.length
  } else {
    nextIndex = Math.max(0, Math.min(items.length - 1, nextIndex))
  }

  if (nextIndex === currentIndex && currentIndex !== -1) return

  event.preventDefault()
  items[nextIndex]?.focus()
}

export function ActionListRoot<As extends ValidComponent = 'ul'>(
  props: ActionListProps<As>,
) {
  let listRef: HTMLElement | undefined
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'disableFocusZone',
    'onKeyDown',
    'ref',
    'role',
    'selectionVariant',
    'showDividers',
    'variant',
  ])
  const headingId = createUniqueId()
  const containerContext = useContext(ActionListContainerContext)
  const role = () => local.role ?? containerContext.listRole
  const variant = () => local.variant ?? 'inset'
  const selectionVariant = () =>
    local.selectionVariant ?? containerContext.selectionVariant
  const showDividers = () => local.showDividers ?? false
  const enableFocusZone = () => {
    if (containerContext.enableFocusZone !== undefined) {
      return containerContext.enableFocusZone
    }

    if (local.disableFocusZone) return false

    return ['menu', 'menubar', 'listbox', 'tablist'].includes(role() ?? '')
  }
  const getAriaLabelledBy = (heading: SlotMarker<'heading'> | undefined) => {
    if (heading) {
      const props = heading.props as ActionListHeadingProps
      return (props.id as string | undefined) ?? headingId
    }

    return containerContext.listLabelledBy
  }
  const wrapFocus = () =>
    role() === 'menu' ||
    containerContext.container === 'SelectPanel' ||
    containerContext.container === 'FilteredActionList'

  return (
    <ListContext.Provider
      value={{
        headingId,
        role: role(),
        selectionVariant: selectionVariant(),
        showDividers: showDividers(),
        variant: variant(),
      }}
    >
      {(() => {
        const slots = partitionActionListChildren(local.children)

        return (
          <>
            <Show when={slots().heading}>
              {renderListHeading(
                slots().heading!,
                headingId,
                variant(),
                containerContext.container,
              )}
            </Show>
            <Dynamic
              component={(local.as ?? 'ul') as ValidComponent}
              {...(rest as Record<string, unknown>)}
              ref={(element: unknown) => {
                if (element instanceof HTMLElement) {
                  listRef = element
                }
                assignRef(local.ref, element)
              }}
              class={mergeClassNames(
                styles.ActionList,
                local.className,
                local.class,
              )}
              role={role()}
              aria-labelledby={getAriaLabelledBy(slots().heading)}
              data-component="ActionList"
              data-dividers={showDividers() ? 'true' : undefined}
              data-variant={variant()}
              onKeyDown={(
                event: KeyboardEvent & {
                  currentTarget: HTMLElement
                  target: Element
                },
              ) => {
                callEventHandler(local.onKeyDown, event)
                if (event.defaultPrevented || !enableFocusZone() || !listRef)
                  return
                handleFocusZoneNavigation(event, listRef, wrapFocus())
              }}
            >
              {slots().items}
            </Dynamic>
          </>
        )
      })()}
    </ListContext.Provider>
  )
}

export function Group(props: ActionListGroupProps) {
  const [local, rest] = splitProps(props, [
    'aria-label',
    'auxiliaryText',
    'children',
    'class',
    'className',
    'role',
    'selectionVariant',
    'title',
    'variant',
  ])
  const listContext = useContext(ListContext)
  const generatedId = createUniqueId()

  return (
    <li
      {...rest}
      class={mergeClassNames(groupStyles.Group, local.className, local.class)}
      data-component="ActionList.Group"
      role={listContext.role ? 'none' : undefined}
    >
      {(() => {
        const slots = partitionGroupChildren(local.children)
        const groupHeadingId = createMemo(() => {
          const heading = slots().groupHeading
          if (heading) {
            return (heading.props.id as string | undefined) ?? generatedId
          }

          return local.title ? generatedId : undefined
        })

        return (
          <GroupContext.Provider
            value={{
              groupHeadingId: groupHeadingId(),
              selectionVariant: local.selectionVariant,
            }}
          >
            <Show when={local.title && !slots().groupHeading}>
              {renderGroupHeading(
                createSlot('groupHeading', {
                  _internalBackwardCompatibleTitle: local.title,
                  auxiliaryText: local.auxiliaryText,
                  headingWrapElement: 'div',
                  variant: local.variant ?? 'subtle',
                }) as unknown as SlotMarker<'groupHeading'>,
                groupHeadingId(),
                listContext.role,
              )}
            </Show>
            <Show when={!local.title && slots().groupHeading}>
              {renderGroupHeading(
                slots().groupHeading!,
                groupHeadingId(),
                listContext.role,
              )}
            </Show>
            <ul
              aria-labelledby={listContext.role ? undefined : groupHeadingId()}
              aria-label={
                (local['aria-label'] as string | undefined) ??
                (listContext.role
                  ? (local.title ??
                    getStringChild(slots().groupHeading?.props.children))
                  : undefined)
              }
              role={local.role ?? (listContext.role ? 'group' : undefined)}
              class={groupStyles.GroupList}
            >
              {slots().items}
            </ul>
          </GroupContext.Provider>
        )
      })()}
    </li>
  )
}

export function Divider(props: ActionListDividerProps) {
  const [local, rest] = splitProps(props, ['class', 'className'])

  return (
    <li
      {...rest}
      class={mergeClassNames(styles.Divider, local.className, local.class)}
      aria-hidden="true"
      data-component="ActionList.Divider"
    />
  )
}

export function Item(props: ActionListItemProps) {
  const generatedId = createUniqueId()
  const [local, rest] = splitProps(props, [
    '_PrivateItemWrapper',
    'active',
    'children',
    'class',
    'className',
    'disabled',
    'id',
    'inactiveText',
    'loading',
    'onSelect',
    'ref',
    'role',
    'selected',
    'size',
    'variant',
  ])
  const slots = partitionItemChildren(local.children)
  const listContext = useContext(ListContext)
  const groupContext = useContext(GroupContext)
  const containerContext = useContext(ActionListContainerContext)
  const inactive = () => Boolean(local.inactiveText)
  const menuContext = () =>
    containerContext.container === 'ActionMenu' ||
    containerContext.container === 'SelectPanel' ||
    containerContext.container === 'FilteredActionList'
  const selectionVariant = () =>
    groupContext.selectionVariant !== undefined
      ? groupContext.selectionVariant
      : listContext.selectionVariant

  let inferredItemRole: string | undefined
  if (containerContext.container === 'ActionMenu') {
    if (selectionVariant() === 'single') inferredItemRole = 'menuitemradio'
    else if (selectionVariant() === 'multiple')
      inferredItemRole = 'menuitemcheckbox'
    else inferredItemRole = 'menuitem'
  } else if (listContext.role === 'listbox') {
    if (selectionVariant() !== undefined && !local.role)
      inferredItemRole = 'option'
  } else if (listContext.role === 'tablist') {
    inferredItemRole = 'tab'
  }

  const itemRole = () => local.role ?? inferredItemRole

  if (slots().trailingAction && menuContext()) {
    throw new Error(
      'ActionList.TrailingAction can not be used within a list with an ARIA role of "menu" or "listbox".',
    )
  }

  let inferredSelectionAttribute: SelectionAttribute | undefined
  if (itemRole() === 'menuitemradio' || itemRole() === 'menuitemcheckbox') {
    inferredSelectionAttribute = 'aria-checked'
  } else if (itemRole() === 'option') {
    inferredSelectionAttribute = 'aria-selected'
  }

  const itemSelectionAttribute =
    containerContext.selectionAttribute ?? inferredSelectionAttribute
  const listItemSemantics = () =>
    ['option', 'menuitem', 'menuitemradio', 'menuitemcheckbox', 'tab'].includes(
      itemRole() ?? '',
    )
  const listSemantics = () =>
    ['listbox', 'menu', 'list'].includes(listContext.role ?? '') ||
    inactive() ||
    listItemSemantics()
  const buttonSemantics = () => !listSemantics() && !local._PrivateItemWrapper
  const showInactiveIndicator = () =>
    inactive() && !['menu', 'listbox'].includes(listContext.role ?? '')

  const itemId = () => local.id ?? generatedId
  const labelId = () => `${itemId()}--label`
  const inlineDescriptionId = () => `${itemId()}--inline-description`
  const blockDescriptionId = () => `${itemId()}--block-description`
  const trailingVisualId = () => `${itemId()}--trailing-visual`
  const inactiveWarningId = () =>
    local.inactiveText ? `${itemId()}--warning-message` : undefined

  const hasTrailingVisualSlot = () => Boolean(slots().trailingVisual)
  const descriptionVariant = () =>
    (slots().description?.props.variant as 'inline' | 'block' | undefined) ??
    'inline'
  const ariaLabelledBy = () => {
    const parts = [labelId()]
    if (hasTrailingVisualSlot()) parts.push(trailingVisualId())
    return parts.join(' ')
  }
  const ariaDescribedBy = () => {
    const parts: Array<string> = []
    if (slots().description) {
      parts.push(
        descriptionVariant() === 'block'
          ? blockDescriptionId()
          : inlineDescriptionId(),
      )
    }
    if (inactiveWarningId()) parts.push(inactiveWarningId()!)
    return parts.length > 0 ? parts.join(' ') : undefined
  }
  const buttonTitle = () => {
    const description = slots().description
    if (!buttonSemantics() || !description) return undefined
    if (!(description.props.truncate as boolean | undefined)) return undefined
    return getStringChild(description.props.children)
  }
  const includeSelectionAttribute = () =>
    Boolean(
      itemSelectionAttribute &&
      itemRole() &&
      ['menuitemradio', 'menuitemcheckbox', 'option'].includes(itemRole()!),
    )

  const onSelect = (event: MouseEvent | KeyboardEvent) => {
    local.onSelect?.(event)
    if (event.defaultPrevented) return
    containerContext.afterSelect?.(event)
  }

  const clickHandler: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = (
    event,
  ) => {
    if (local.disabled || inactive() || local.loading) return
    onSelect(event as MouseEvent)
  }

  const keyPressHandler: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (
    event,
  ) => {
    if (local.disabled || inactive() || local.loading) return
    if (event.key !== ' ' && event.key !== 'Enter') return
    if (event.key === ' ') event.preventDefault()
    onSelect(event as KeyboardEvent)
  }

  const menuItemProps = createMemo(() => {
    const value: Record<string, unknown> = {
      'aria-describedby': ariaDescribedBy(),
      'aria-disabled': local.disabled ? true : undefined,
      'aria-labelledby': ariaLabelledBy(),
      'data-inactive': inactive() ? 'true' : undefined,
      'data-loading': local.loading && !inactive() ? 'true' : undefined,
      id: itemId(),
      onClick: clickHandler,
      onKeyPress: !buttonSemantics() ? keyPressHandler : undefined,
      role: itemRole(),
      tabIndex: showInactiveIndicator() ? undefined : 0,
      title: buttonTitle(),
    }

    if (includeSelectionAttribute()) {
      value[itemSelectionAttribute!] = local.selected
    }

    return value as ItemWrapperRenderProps & Record<string, unknown>
  })

  const containerProps = createMemo(() => {
    if (local._PrivateItemWrapper) {
      return {
        ...(rest as Record<string, unknown>),
        role: itemRole() ? 'none' : undefined,
      }
    }

    if (listSemantics()) {
      return {
        ...(rest as Record<string, unknown>),
        ...menuItemProps(),
      }
    }

    return rest as Record<string, unknown>
  })

  const wrapperProps = createMemo(() => {
    if (local._PrivateItemWrapper) return menuItemProps()
    if (!listSemantics()) {
      return {
        ...(rest as Record<string, unknown>),
        ...menuItemProps(),
      }
    }
    return undefined
  })

  const defaultTrailingVisual = () =>
    containerContext.defaultTrailingVisual ? (
      <span class={styles.VisualWrap}>
        {containerContext.defaultTrailingVisual}
      </span>
    ) : undefined
  const explicitTrailingVisual = () =>
    slots().trailingVisual
      ? renderVisualSlot(
          slots().trailingVisual!,
          'trailing',
          trailingVisualId(),
        )
      : undefined
  const trailingVisual = () =>
    explicitTrailingVisual() ?? defaultTrailingVisual()
  const content = () => slots().items
  const selection = () =>
    renderSelection(
      selectionVariant() || undefined,
      listContext.role,
      local.selected,
    )
  const leadingVisual = () =>
    slots().leadingVisual
      ? renderVisualSlot(slots().leadingVisual!, 'leading')
      : undefined
  const description = () =>
    slots().description
      ? renderDescriptionSlot(slots().description!, {
          blockDescriptionId: blockDescriptionId(),
          buttonSemantics: buttonSemantics(),
          inlineDescriptionId: inlineDescriptionId(),
        })
      : undefined

  const renderVisualOrIndicator = (
    position: 'leading' | 'trailing',
    visual: JSX.Element | undefined,
  ) => {
    if (!local.loading && !local.inactiveText) return visual

    const itemHasLeadingVisual = Boolean(slots().leadingVisual)
    const showIndicatorHere = local.inactiveText
      ? (itemHasLeadingVisual && position === 'leading') ||
        (!itemHasLeadingVisual && position === 'trailing')
      : (itemHasLeadingVisual && position === 'leading') ||
        (!itemHasLeadingVisual && position === 'trailing')

    if (!showIndicatorHere) return visual

    if (local.inactiveText) {
      return (
        <span class={styles.InactiveButtonWrap}>
          <button
            type="button"
            class={styles.InactiveButtonReset}
            aria-labelledby={labelId()}
            aria-describedby={inactiveWarningId()}
          >
            <span
              class={mergeClassNames(
                styles.VisualWrap,
                position === 'leading'
                  ? styles.LeadingVisual
                  : styles.TrailingVisual,
              )}
            >
              <ActionListAlertIcon />
            </span>
          </button>
        </span>
      )
    }

    return (
      <span
        class={mergeClassNames(
          styles.VisualWrap,
          position === 'leading' ? styles.LeadingVisual : styles.TrailingVisual,
        )}
      >
        <Spinner size="small" />
      </span>
    )
  }

  const wrapperElement = () => {
    if (local._PrivateItemWrapper) {
      return local._PrivateItemWrapper({
        ...(wrapperProps() as ItemWrapperRenderProps),
        children: (
          <>
            <span class={styles.Spacer} />
            {selection()}
            {renderVisualOrIndicator('leading', leadingVisual())}
            <span
              class={styles.ActionListSubContent}
              data-component="ActionList.Item--DividerContainer"
            >
              <Show
                when={description()}
                fallback={
                  <span
                    id={labelId()}
                    class={styles.ItemLabel}
                    data-component="ActionList.Item.Label"
                  >
                    {content()}
                    <Show when={local.loading && !inactive()}>
                      <VisuallyHidden>Loading</VisuallyHidden>
                    </Show>
                  </span>
                }
              >
                <span
                  class={styles.ItemDescriptionWrap}
                  data-description-variant={descriptionVariant()}
                >
                  <span
                    id={labelId()}
                    class={styles.ItemLabel}
                    data-component="ActionList.Item.Label"
                  >
                    {content()}
                    <Show when={local.loading && !inactive()}>
                      <VisuallyHidden>Loading</VisuallyHidden>
                    </Show>
                  </span>
                  {description()}
                </span>
              </Show>
              {renderVisualOrIndicator('trailing', trailingVisual())}
              <Show when={!showInactiveIndicator() && local.inactiveText}>
                <span class={styles.InactiveWarning} id={inactiveWarningId()}>
                  {local.inactiveText}
                </span>
              </Show>
            </span>
          </>
        ),
        class: styles.ActionListContent,
      })
    }

    return (
      <Dynamic
        component={listSemantics() ? 'div' : 'button'}
        {...(wrapperProps() as Record<string, unknown>)}
        ref={(element: unknown) => {
          if (!listSemantics()) assignRef(local.ref, element)
        }}
        type={listSemantics() ? undefined : 'button'}
        class={styles.ActionListContent}
        data-size={local.size ?? 'medium'}
        title={buttonTitle()}
      >
        <span class={styles.Spacer} />
        {selection()}
        {renderVisualOrIndicator('leading', leadingVisual())}
        <span
          class={styles.ActionListSubContent}
          data-component="ActionList.Item--DividerContainer"
        >
          <Show
            when={description()}
            fallback={
              <span
                id={labelId()}
                class={styles.ItemLabel}
                data-component="ActionList.Item.Label"
              >
                {content()}
                <Show when={local.loading && !inactive()}>
                  <VisuallyHidden>Loading</VisuallyHidden>
                </Show>
              </span>
            }
          >
            <span
              class={styles.ItemDescriptionWrap}
              data-description-variant={descriptionVariant()}
            >
              <span
                id={labelId()}
                class={styles.ItemLabel}
                data-component="ActionList.Item.Label"
              >
                {content()}
                <Show when={local.loading && !inactive()}>
                  <VisuallyHidden>Loading</VisuallyHidden>
                </Show>
              </span>
              {description()}
            </span>
          </Show>
          {renderVisualOrIndicator('trailing', trailingVisual())}
          <Show when={!showInactiveIndicator() && local.inactiveText}>
            <span class={styles.InactiveWarning} id={inactiveWarningId()}>
              {local.inactiveText}
            </span>
          </Show>
        </span>
      </Dynamic>
    )
  }

  return (
    <li
      {...containerProps()}
      ref={(element) => {
        if (listSemantics() || local._PrivateItemWrapper)
          assignRef(local.ref, element)
      }}
      class={mergeClassNames(
        styles.ActionListItem,
        local.className,
        local.class,
      )}
      data-component="ActionList.Item"
      data-active={local.active ? 'true' : undefined}
      data-has-description={slots().description ? 'true' : 'false'}
      data-has-trailing-action={slots().trailingAction ? 'true' : undefined}
      data-inactive={local.inactiveText ? 'true' : undefined}
      data-is-disabled={local.disabled ? 'true' : undefined}
      data-loading={local.loading && !inactive() ? 'true' : undefined}
      data-variant={local.variant === 'danger' ? 'danger' : undefined}
    >
      {wrapperElement()}
      <Show when={showInactiveIndicator() && local.inactiveText}>
        <VisuallyHidden id={inactiveWarningId()}>
          {local.inactiveText}
        </VisuallyHidden>
      </Show>
      <Show
        when={
          !inactive() &&
          !local.loading &&
          !menuContext() &&
          slots().trailingAction
        }
      >
        {renderTrailingAction(slots().trailingAction!)}
      </Show>
    </li>
  )
}

export function LinkItem<As extends ValidComponent = 'a'>(
  props: ActionListLinkItemProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'active',
    'as',
    'children',
    'class',
    'className',
    'inactiveText',
    'ref',
    'size',
    'variant',
  ])

  return (
    <Item
      active={local.active}
      class={local.class}
      className={local.className}
      inactiveText={local.inactiveText}
      variant={local.variant}
      size={local.size}
      _PrivateItemWrapper={(wrapperProps) => {
        const clickHandler: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = (
          event,
        ) => {
          callEventHandler(wrapperProps.onClick, event)
          callEventHandler(rest.onClick, event)
        }

        if (local.inactiveText) {
          return (
            <span
              id={wrapperProps.id}
              role={
                wrapperProps.role as JSX.HTMLAttributes<HTMLSpanElement>['role']
              }
              tabIndex={wrapperProps.tabIndex}
              title={wrapperProps.title}
              aria-disabled={wrapperProps['aria-disabled']}
              aria-labelledby={wrapperProps['aria-labelledby']}
              aria-describedby={wrapperProps['aria-describedby']}
              class={wrapperProps.class}
              onClick={clickHandler}
              onKeyPress={wrapperProps.onKeyPress}
            >
              {wrapperProps.children}
            </span>
          )
        }

        return (
          <Link
            {...(rest as Record<string, unknown>)}
            as={(local.as ?? 'a') as ValidComponent}
            ref={local.ref}
            class={wrapperProps.class}
            onClick={clickHandler}
            onKeyPress={wrapperProps.onKeyPress}
            role={wrapperProps.role as ComponentProps<As>['role']}
            id={wrapperProps.id}
            aria-disabled={wrapperProps['aria-disabled']}
            aria-labelledby={wrapperProps['aria-labelledby']}
            aria-describedby={wrapperProps['aria-describedby']}
            tabIndex={wrapperProps.tabIndex}
            title={wrapperProps.title}
          >
            {wrapperProps.children}
          </Link>
        )
      }}
    >
      {local.children}
    </Item>
  )
}

export function Heading(props: ActionListHeadingProps) {
  return createSlot('heading', props as Record<string, unknown>)
}

export function GroupHeading(props: ActionListGroupHeadingProps) {
  return createSlot('groupHeading', props as Record<string, unknown>)
}

export function Description(props: ActionListDescriptionProps) {
  return createSlot('description', props as Record<string, unknown>)
}

export function LeadingVisual(props: ActionListLeadingVisualProps) {
  return createSlot('leadingVisual', props as Record<string, unknown>)
}

export function TrailingVisual(props: ActionListTrailingVisualProps) {
  return createSlot('trailingVisual', props as Record<string, unknown>)
}

export function TrailingAction(props: ActionListTrailingActionProps) {
  return createSlot('trailingAction', props as Record<string, unknown>)
}

export const ActionList = Object.assign(ActionListRoot, {
  Description,
  Divider,
  Group,
  GroupContext,
  GroupHeading,
  Heading,
  Item,
  LeadingVisual,
  LinkItem,
  TrailingAction,
  TrailingVisual,
})
;(ActionList as { displayName?: string }).displayName = 'ActionList'
;(Item as { displayName?: string }).displayName = 'ActionList.Item'
;(LinkItem as { displayName?: string }).displayName = 'ActionList.LinkItem'
;(Divider as { displayName?: string }).displayName = 'ActionList.Divider'
;(Description as { displayName?: string }).displayName =
  'ActionList.Description'
;(LeadingVisual as { displayName?: string }).displayName =
  'ActionList.LeadingVisual'
;(TrailingVisual as { displayName?: string }).displayName =
  'ActionList.TrailingVisual'
;(Heading as { displayName?: string }).displayName = 'ActionList.Heading'
;(Group as { displayName?: string }).displayName = 'ActionList.Group'
;(GroupHeading as { displayName?: string }).displayName =
  'ActionList.GroupHeading'
;(TrailingAction as { displayName?: string }).displayName =
  'ActionList.TrailingAction'
