import {
  Show,
  createContext,
  createMemo,
  createRenderEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useOnEscapePress, useOnOutsideClick, useResizeObserver } from '../../hooks'
import { mergeClassNames } from '../../utils'
import { assignRef, callEventHandler, type RefProp } from '../../utils/solid'
import { ActionList } from '../ActionList'
import { Button } from '../Button'
import { CounterLabel } from '../CounterLabel'
import { Octicon } from '../Octicon'
import visuallyHiddenStyles from '../VisuallyHidden/VisuallyHidden.module.css'
import styles from './UnderlineNav.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type UnderlineNavVisual = JSX.Element | ValidComponent

type UnderlineNavContextValue = {
  upsert: (id: string, props: UnderlineNavItemProps<ValidComponent>) => void
  remove: (id: string) => void
}

type RegisteredUnderlineNavItem = {
  id: string
  props: UnderlineNavItemProps<ValidComponent>
}

type ItemWidth = {
  full: number
  noIcon: number
}

type ResponsiveState = {
  items: Array<RegisteredUnderlineNavItem>
  menuItems: Array<RegisteredUnderlineNavItem>
  iconsVisible: boolean
  overflowMeasured: boolean
}

type UnderlineNavOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<unknown>
  loadingCounters?: boolean
  variant?: 'inset' | 'flush'
}

export type UnderlineNavProps<As extends ValidComponent = 'nav'> =
  DistributiveOmit<ComponentProps<As>, keyof UnderlineNavOwnProps<As>> &
    UnderlineNavOwnProps<As>

type UnderlineNavItemOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<unknown>
  onSelect?: (event: MouseEvent | KeyboardEvent) => void
  'aria-current'?:
    | 'page'
    | 'step'
    | 'location'
    | 'date'
    | 'time'
    | 'true'
    | 'false'
    | boolean
  /**
   * @deprecated Use the `leadingVisual` prop instead.
   */
  icon?: UnderlineNavVisual
  leadingVisual?: JSX.Element
  counter?: number | string
}

export type UnderlineNavItemProps<As extends ValidComponent = 'a'> =
  DistributiveOmit<ComponentProps<As>, keyof UnderlineNavItemOwnProps<As>> &
    UnderlineNavItemOwnProps<As>

const UnderlineNavContext = createContext<UnderlineNavContextValue>()

export const MORE_BTN_WIDTH = 86
const GAP = 8

function isDevelopment() {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV
  return env ? env !== 'production' : false
}

function isCurrent(
  value:
    | UnderlineNavItemProps<ValidComponent>['aria-current']
    | undefined,
) {
  return value !== undefined && value !== false && value !== 'false'
}

function getTextContent(children: unknown): string {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(getTextContent).join('')
  }

  return ''
}

function renderVisual(visual: UnderlineNavVisual | undefined) {
  if (!visual) return undefined

  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  if (typeof visual === 'function') {
    return <Component component={visual as ValidComponent} />
  }

  return visual
}

function calculatePossibleItems(
  widths: number[],
  navWidth: number,
  moreMenuWidth = 0,
) {
  const widthToFit = navWidth - moreMenuWidth
  let breakpoint = widths.length
  let sum = 0

  for (const [index, width] of widths.entries()) {
    sum += width + GAP
    if (sum > widthToFit) {
      breakpoint = index
      break
    }
  }

  return breakpoint
}

function createResponsiveState(
  items: Array<RegisteredUnderlineNavItem>,
  widths: Record<string, ItemWidth>,
  navWidth: number,
): ResponsiveState {
  if (items.length === 0) {
    return {
      items,
      menuItems: [],
      iconsVisible: true,
      overflowMeasured: false,
    }
  }

  const widthEntries = items.map((item) => widths[item.id]).filter(Boolean)
  if (widthEntries.length !== items.length || navWidth === 0) {
    return {
      items,
      menuItems: [],
      iconsVisible: true,
      overflowMeasured: false,
    }
  }

  const fullWidths = widthEntries.map((width) => width.full)
  const noIconWidths = widthEntries.map((width) => width.noIcon)
  const numberOfItemsPossible = calculatePossibleItems(fullWidths, navWidth)
  const numberOfItemsWithoutIconPossible = calculatePossibleItems(
    noIconWidths,
    navWidth,
  )
  const numberOfItemsPossibleWithMoreMenu = calculatePossibleItems(
    noIconWidths,
    navWidth,
    MORE_BTN_WIDTH,
  )

  if (items.length <= numberOfItemsPossible) {
    return {
      items,
      menuItems: [],
      iconsVisible: true,
      overflowMeasured: true,
    }
  }

  if (items.length <= numberOfItemsWithoutIconPossible) {
    return {
      items,
      menuItems: [],
      iconsVisible: false,
      overflowMeasured: true,
    }
  }

  const listItems: Array<RegisteredUnderlineNavItem> = []
  const menuItems: Array<RegisteredUnderlineNavItem> = []
  const numberOfItemsInMenu = items.length - numberOfItemsPossibleWithMoreMenu
  const numberOfListItems = Math.max(
    0,
    numberOfItemsInMenu === 1
      ? numberOfItemsPossibleWithMoreMenu - 1
      : numberOfItemsPossibleWithMoreMenu,
  )

  for (const [index, item] of items.entries()) {
    if (index < numberOfListItems) {
      listItems.push(item)
      continue
    }

    if (isCurrent(item.props['aria-current']) && numberOfListItems > 0) {
      const indexToReplaceAt = numberOfListItems - 1
      const displacedItem = listItems.splice(indexToReplaceAt, 1, item)[0]
      if (displacedItem) menuItems.push(displacedItem)
      continue
    }

    menuItems.push(item)
  }

  return {
    items: listItems,
    menuItems,
    iconsVisible: false,
    overflowMeasured: true,
  }
}

function UnderlineNavLoadingCounter() {
  return <span class={styles.LoadingCounter} />
}

function MenuItemCounter(props: {
  counter: number | string | undefined
  loadingCounters: boolean
}) {
  return (
    <Show when={props.counter !== undefined}>
      <span data-component="counter">
        <Show
          when={!props.loadingCounters}
          fallback={<UnderlineNavLoadingCounter />}
        >
          <CounterLabel>{props.counter}</CounterLabel>
        </Show>
      </span>
    </Show>
  )
}

function RenderedUnderlineNavItem(props: {
  itemProps: UnderlineNavItemProps<ValidComponent>
  iconsVisible: boolean
  loadingCounters: boolean
  itemRef?: RefProp<unknown>
  tabIndex?: number
  interactive?: boolean
}) {
  const [local, rest] = splitProps(
    props.itemProps as UnderlineNavItemProps<ValidComponent> &
      Record<string, unknown>,
    [
    'aria-current',
    'as',
    'children',
    'class',
    'className',
    'counter',
    'href',
    'icon',
    'leadingVisual',
    'onClick',
    'onKeyDown',
    'onSelect',
    'ref',
    'tabIndex',
    ],
  )
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element
  const resolvedVisual = () => local.leadingVisual ?? renderVisual(local.icon)
  const textContent = () => getTextContent(local.children)
  const isAnchor = () => (local.as ?? 'a') === 'a'

  const clickHandler: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = (
    event,
  ) => {
    callEventHandler(local.onClick, event)
    if (event.defaultPrevented || props.interactive === false) return
    local.onSelect?.(event as MouseEvent)
  }

  const keyDownHandler: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (
    event,
  ) => {
    callEventHandler(local.onKeyDown, event)
    if (event.defaultPrevented || props.interactive === false || !local.onSelect)
      return
    if (event.key !== ' ' && event.key !== 'Enter') return
    if (event.key === ' ') event.preventDefault()
    local.onSelect(event as KeyboardEvent)
  }

  return (
    <li class={styles.UnderlineNavItem}>
      <Component
        component={(local.as ?? 'a') as ValidComponent}
        {...(rest as Record<string, unknown>)}
        ref={(element: unknown) => {
          assignRef(props.itemRef ?? local.ref, element)
        }}
        class={mergeClassNames(
          styles.UnderlineItem,
          local.className,
          local.class,
        )}
        aria-current={local['aria-current']}
        href={isAnchor() ? (local.href ?? '#') : local.href}
        onClick={clickHandler}
        onKeyDown={keyDownHandler}
        tabIndex={props.tabIndex ?? local.tabIndex}
      >
        <Show when={props.iconsVisible && resolvedVisual()}>
          <span data-component="icon">{resolvedVisual()}</span>
        </Show>
        <Show when={local.children !== undefined && local.children !== null}>
          <span
            data-component="text"
            data-content={textContent() || undefined}
          >
            {local.children}
          </span>
        </Show>
        <MenuItemCounter
          counter={local.counter}
          loadingCounters={props.loadingCounters}
        />
      </Component>
    </li>
  )
}

function UnderlineNavRoot<As extends ValidComponent = 'nav'>(
  props: UnderlineNavProps<As>,
) {
  let navRef: HTMLElement | undefined
  let moreButtonRef: HTMLButtonElement | undefined
  let menuRef: HTMLElement | undefined
  const fullMeasureRefs = new Map<string, HTMLElement>()
  const noIconMeasureRefs = new Map<string, HTMLElement>()
  const disclosureWidgetId = createUniqueId()
  const [registeredItems, setRegisteredItems] = createSignal<
    Array<RegisteredUnderlineNavItem>
  >([])
  const [navWidth, setNavWidth] = createSignal(0)
  const [isWidgetOpen, setIsWidgetOpen] = createSignal(false)
  const [itemWidths, setItemWidths] = createSignal<Record<string, ItemWidth>>({})
  const [local, rest] = splitProps(props, [
    'aria-label',
    'as',
    'children',
    'class',
    'className',
    'loadingCounters',
    'ref',
    'variant',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  const contextValue: UnderlineNavContextValue = {
    upsert: (id, itemProps) => {
      setRegisteredItems((current) => {
        const index = current.findIndex((item) => item.id === id)
        if (index === -1) return [...current, { id, props: itemProps }]

        const next = current.slice()
        next[index] = { id, props: itemProps }
        return next
      })
    },
    remove: (id) => {
      setRegisteredItems((current) => current.filter((item) => item.id !== id))
      setItemWidths((current) => {
        if (!(id in current)) return current
        const next = { ...current }
        delete next[id]
        return next
      })
      fullMeasureRefs.delete(id)
      noIconMeasureRefs.delete(id)
    },
  }

  const responsiveState = createMemo(() =>
    createResponsiveState(registeredItems(), itemWidths(), navWidth()),
  )
  const onlyMenuVisible = createMemo(
    () =>
      responsiveState().items.length === 0 &&
      responsiveState().menuItems.length > 0,
  )

  if (isDevelopment() && !local['aria-label']) {
    throw new Error(
      'Use the `aria-label` prop to provide an accessible label for assistive technology',
    )
  }

  createRenderEffect(() => {
    const currentItems = registeredItems().filter((item) =>
      isCurrent(item.props['aria-current']),
    )

    if (currentItems.length > 1) {
      throw new Error('Only one current element is allowed')
    }
  })

  createRenderEffect(() => {
    registeredItems()
    local.loadingCounters

    queueMicrotask(() => {
      const nextWidths: Record<string, ItemWidth> = {}

      for (const item of registeredItems()) {
        const full = fullMeasureRefs.get(item.id)
        const noIcon = noIconMeasureRefs.get(item.id)
        if (!full || !noIcon) continue

        nextWidths[item.id] = {
          full: full.getBoundingClientRect().width,
          noIcon: noIcon.getBoundingClientRect().width,
        }
      }

      setItemWidths(nextWidths)
    })
  })

  createRenderEffect(() => {
    if (responsiveState().menuItems.length === 0 && isWidgetOpen()) {
      setIsWidgetOpen(false)
    }
  })

  useResizeObserver(
    (entries) => {
      const entry = entries[0]
      if (entry) setNavWidth(entry.contentRect.width)
    },
    () => navRef,
  )

  const closeOverlay = () => {
    setIsWidgetOpen(false)
  }

  useOnEscapePress((event) => {
    if (!isWidgetOpen()) return
    event.preventDefault()
    closeOverlay()
    moreButtonRef?.focus()
  })

  useOnOutsideClick({
    containerRef: () => menuRef,
    ignoreClickRefs: [() => moreButtonRef],
    onClickOutside: () => {
      if (isWidgetOpen()) closeOverlay()
    },
  })

  return (
    <Component
      component={(local.as ?? 'nav') as ValidComponent}
      {...(rest as Record<string, unknown>)}
      ref={(element: unknown) => {
        if (element instanceof HTMLElement) navRef = element
        assignRef(local.ref, element)
      }}
      class={mergeClassNames(
        styles.UnderlineWrapper,
        local.className,
        local.class,
      )}
      aria-label={local['aria-label']}
      data-variant={local.variant ?? 'inset'}
      data-overflow-measured={
        responsiveState().overflowMeasured ? 'true' : 'false'
      }
    >
      <Show when={local['aria-label']}>
        <h2 class={visuallyHiddenStyles.VisuallyHidden}>
          {local['aria-label']} navigation
        </h2>
      </Show>

      <div hidden aria-hidden="true">
        <UnderlineNavContext.Provider value={contextValue}>
          {local.children}
        </UnderlineNavContext.Provider>
      </div>

      <ul class={styles.UnderlineItemList} role="list">
        {responsiveState().items.map((item) => (
          <RenderedUnderlineNavItem
            itemProps={item.props}
            iconsVisible={responsiveState().iconsVisible}
            loadingCounters={local.loadingCounters ?? false}
          />
        ))}
        <Show when={responsiveState().menuItems.length > 0}>
          <li class={styles.MenuItem}>
            <Show when={!onlyMenuVisible()}>
              <div class={styles.MenuDivider} />
            </Show>
            <Button
              ref={(element) => {
                moreButtonRef = element as HTMLButtonElement
              }}
              aria-controls={disclosureWidgetId}
              aria-expanded={isWidgetOpen()}
              class={styles.MoreButton}
              onClick={(event) => {
                if (event.defaultPrevented || event.button !== 0) return
                setIsWidgetOpen((open) => !open)
              }}
              trailingAction={<Octicon name="triangle-down" />}
              variant="invisible"
            >
              <Show
                when={!onlyMenuVisible()}
                fallback={
                  <>
                    <span class={visuallyHiddenStyles.VisuallyHidden}>
                      {local['aria-label']}&nbsp;
                    </span>
                    Menu
                  </>
                }
              >
                <>
                  More
                  <span class={visuallyHiddenStyles.VisuallyHidden}>
                    &nbsp;{local['aria-label']} items
                  </span>
                </>
              </Show>
            </Button>
            <Show when={isWidgetOpen()}>
              <ActionList
                id={disclosureWidgetId}
                ref={(element) => {
                  menuRef = element as HTMLElement
                }}
                class={styles.MenuActionList}
              >
                {responsiveState().menuItems.map((item) => {
                  const [itemLocal, itemRest] = splitProps(item.props, [
                    'aria-current',
                    'as',
                    'children',
                    'class',
                    'className',
                    'counter',
                    'href',
                    'icon',
                    'leadingVisual',
                    'onSelect',
                    'ref',
                  ])

                  return (
                    <ActionList.LinkItem
                      {...(itemRest as Record<string, unknown>)}
                      as={(itemLocal.as ?? 'a') as ValidComponent}
                      class={mergeClassNames(
                        itemLocal.className,
                        itemLocal.class,
                      )}
                      href={
                        (itemLocal.as ?? 'a') === 'a'
                          ? (itemLocal.href as string | undefined) ?? '#'
                          : (itemLocal.href as string | undefined)
                      }
                      aria-current={itemLocal['aria-current']}
                      onClick={(event: MouseEvent) => {
                        itemLocal.onSelect?.(event)
                        closeOverlay()
                        moreButtonRef?.focus()
                      }}
                    >
                      <span class={styles.MenuItemContent}>
                        <span>{itemLocal.children}</span>
                        <MenuItemCounter
                          counter={itemLocal.counter}
                          loadingCounters={local.loadingCounters ?? false}
                        />
                      </span>
                    </ActionList.LinkItem>
                  )
                })}
              </ActionList>
            </Show>
          </li>
        </Show>
      </ul>

      <div class={styles.MeasurementContainer} aria-hidden="true">
        <ul class={styles.UnderlineItemList} role="presentation">
          {registeredItems().map((item) => (
            <RenderedUnderlineNavItem
              itemProps={item.props}
              iconsVisible={true}
              loadingCounters={local.loadingCounters ?? false}
              itemRef={(element) => {
                if (element instanceof HTMLElement) {
                  fullMeasureRefs.set(item.id, element)
                }
              }}
              tabIndex={-1}
              interactive={false}
            />
          ))}
        </ul>
        <ul class={styles.UnderlineItemList} role="presentation">
          {registeredItems().map((item) => (
            <RenderedUnderlineNavItem
              itemProps={item.props}
              iconsVisible={false}
              loadingCounters={local.loadingCounters ?? false}
              itemRef={(element) => {
                if (element instanceof HTMLElement) {
                  noIconMeasureRefs.set(item.id, element)
                }
              }}
              tabIndex={-1}
              interactive={false}
            />
          ))}
        </ul>
      </div>
    </Component>
  )
}

function UnderlineNavItem<As extends ValidComponent = 'a'>(
  props: UnderlineNavItemProps<As>,
) {
  const context = useContext(UnderlineNavContext)

  if (!context) {
    return (
      <RenderedUnderlineNavItem
        itemProps={props}
        iconsVisible={true}
        loadingCounters={false}
      />
    )
  }

  const id = createUniqueId()

  createRenderEffect(() => {
    context.upsert(id, props as UnderlineNavItemProps<ValidComponent>)
  })

  onCleanup(() => {
    context.remove(id)
  })

  return null
}

UnderlineNavRoot.displayName = 'UnderlineNav'
UnderlineNavItem.displayName = 'UnderlineNav.Item'

export const UnderlineNav = Object.assign(UnderlineNavRoot, {
  Item: UnderlineNavItem,
})

export default UnderlineNav
