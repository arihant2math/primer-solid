import {
  Show,
  children as resolveChildren,
  createMemo,
  createRenderEffect,
  createSignal,
  createUniqueId,
  splitProps,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js'
import { useResizeObserver } from '../../hooks'
import { mergeClassNames } from '../../utils'
import { assignRef, callEventHandler, type RefProp } from '../../utils/solid'
import {
  UnderlineItem,
  UnderlineItemList,
  UnderlineWrapper,
  type UnderlineItemVisual,
} from '../_internal/UnderlineTabbedInterface'
import styles from './UnderlinePanels.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

const UNDERLINE_PANELS_TAB_SLOT = Symbol('primer-solid.underline-panels.tab')
const UNDERLINE_PANELS_PANEL_SLOT = Symbol(
  'primer-solid.underline-panels.panel',
)

export type UnderlinePanelsProps<As extends ValidComponent = 'div'> =
  DistributiveOmit<ComponentProps<As>, keyof UnderlinePanelsOwnProps<As>> &
    UnderlinePanelsOwnProps<As>

type UnderlinePanelsOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<unknown>
  'aria-label'?: string
  'aria-labelledby'?: string
  id?: string
  loadingCounters?: boolean
}

type UnderlinePanelsTabOwnProps = {
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<HTMLButtonElement>
  'aria-selected'?: boolean | 'true' | 'false'
  onSelect?: (event: MouseEvent | KeyboardEvent) => void
  counter?: number | string
  icon?: UnderlineItemVisual
}

export type UnderlinePanelsTabProps = DistributiveOmit<
  ComponentProps<'button'>,
  | keyof UnderlinePanelsTabOwnProps
  | 'children'
  | 'class'
  | 'className'
  | 'id'
  | 'ref'
  | 'role'
  | 'tabIndex'
  | 'type'
> &
  UnderlinePanelsTabOwnProps

export type UnderlinePanelsPanelProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'id' | 'role' | 'aria-labelledby'
> & {
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<HTMLDivElement>
}

type UnderlinePanelsTabSlot = {
  readonly [UNDERLINE_PANELS_TAB_SLOT]: true
  props: UnderlinePanelsTabProps
}

type UnderlinePanelsPanelSlot = {
  readonly [UNDERLINE_PANELS_PANEL_SLOT]: true
  props: UnderlinePanelsPanelProps
}

function createUnderlinePanelsTabSlot(
  props: UnderlinePanelsTabProps,
): JSX.Element {
  return {
    [UNDERLINE_PANELS_TAB_SLOT]: true,
    props,
  } as UnderlinePanelsTabSlot as unknown as JSX.Element
}

function createUnderlinePanelsPanelSlot(
  props: UnderlinePanelsPanelProps,
): JSX.Element {
  return {
    [UNDERLINE_PANELS_PANEL_SLOT]: true,
    props,
  } as UnderlinePanelsPanelSlot as unknown as JSX.Element
}

function isUnderlinePanelsTabSlot(
  value: unknown,
): value is UnderlinePanelsTabSlot {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<UnderlinePanelsTabSlot>)[UNDERLINE_PANELS_TAB_SLOT] ===
      true
  )
}

function isUnderlinePanelsPanelSlot(
  value: unknown,
): value is UnderlinePanelsPanelSlot {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<UnderlinePanelsPanelSlot>)[
      UNDERLINE_PANELS_PANEL_SLOT
    ] === true
  )
}

function isDevelopment() {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV
  return env ? env !== 'production' : false
}

function isSelected(
  value: UnderlinePanelsTabProps['aria-selected'] | undefined,
) {
  return value === true || value === 'true'
}

function RenderedUnderlinePanelsTab(props: {
  index: number
  totalTabs: number
  tabProps: UnderlinePanelsTabProps
  id: string
  panelId: string
  selected: boolean
  iconsVisible: boolean
  loadingCounters: boolean
  setTabRef: (element: HTMLButtonElement | undefined) => void
  selectTab: (index: number) => void
}) {
  const [local, rest] = splitProps(
    props.tabProps as UnderlinePanelsTabProps & Record<string, unknown>,
    [
      'aria-selected',
      'children',
      'class',
      'className',
      'counter',
      'icon',
      'onClick',
      'onKeyDown',
      'onSelect',
      'ref',
    ],
  )

  const focusAndSelect = (index: number) => {
    props.selectTab(index)
  }

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    callEventHandler(local.onClick, event)
    if (event.defaultPrevented) return
    props.selectTab(props.index)
    local.onSelect?.(event as MouseEvent)
  }

  const onKeyDown: JSX.EventHandlerUnion<
    HTMLButtonElement,
    KeyboardEvent
  > = (event) => {
    callEventHandler(local.onKeyDown, event)
    if (event.defaultPrevented) return

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault()
        focusAndSelect((props.index + 1) % props.totalTabs)
        return
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault()
        focusAndSelect((props.index - 1 + props.totalTabs) % props.totalTabs)
        return
      }
      case 'Home': {
        event.preventDefault()
        focusAndSelect(0)
        return
      }
      case 'End': {
        event.preventDefault()
        focusAndSelect(props.totalTabs - 1)
        return
      }
      case ' ':
      case 'Enter': {
        if (event.key === ' ') event.preventDefault()
        local.onSelect?.(event as KeyboardEvent)
        return
      }
    }
  }

  return (
    <UnderlineItem
      {...(rest as Record<string, unknown>)}
      as="button"
      ref={(element: unknown) => {
        const resolvedElement =
          element instanceof HTMLButtonElement ? element : undefined
        props.setTabRef(resolvedElement)
        assignRef(local.ref, resolvedElement as HTMLButtonElement)
      }}
      class={mergeClassNames(local.className, local.class)}
      role="tab"
      id={props.id}
      type="button"
      aria-selected={props.selected}
      aria-controls={props.panelId}
      tabIndex={props.selected ? 0 : -1}
      icon={local.icon}
      iconsVisible={props.iconsVisible}
      loadingCounters={props.loadingCounters}
      counter={local.counter}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {local.children}
    </UnderlineItem>
  )
}

function RenderedUnderlinePanelsPanel(props: {
  panelProps: UnderlinePanelsPanelProps
  id: string
  tabId: string
  selected: boolean
}) {
  const [local, rest] = splitProps(
    props.panelProps as UnderlinePanelsPanelProps & Record<string, unknown>,
    ['children', 'class', 'className', 'ref'],
  )

  return (
    <div
      {...(rest as JSX.HTMLAttributes<HTMLDivElement>)}
      ref={(element) => assignRef(local.ref, element)}
      class={mergeClassNames(local.className, local.class)}
      id={props.id}
      role="tabpanel"
      aria-labelledby={props.tabId}
      hidden={!props.selected}
      tabIndex={0}
    >
      {local.children}
    </div>
  )
}

function UnderlinePanelsRoot<As extends ValidComponent = 'div'>(
  props: UnderlinePanelsProps<As>,
) {
  let wrapperRef: HTMLElement | undefined
  let listRef: HTMLUListElement | undefined
  const tabRefs: Array<HTMLButtonElement | undefined> = []
  const generatedId = createUniqueId()
  const [iconsVisible, setIconsVisible] = createSignal(true)
  const [selectedIndex, setSelectedIndex] = createSignal(0)
  const [fullListWidth, setFullListWidth] = createSignal(0)
  const [local, rest] = splitProps(props, [
    'aria-label',
    'aria-labelledby',
    'as',
    'children',
    'class',
    'className',
    'id',
    'loadingCounters',
    'ref',
  ])
  const resolvedChildren = resolveChildren(() => local.children)
  const panelGroupId = () => local.id ?? generatedId
  const parsedChildren = createMemo(() => {
    const tabs: UnderlinePanelsTabSlot[] = []
    const panels: UnderlinePanelsPanelSlot[] = []

    for (const child of resolvedChildren.toArray()) {
      if (isUnderlinePanelsTabSlot(child)) {
        tabs.push(child)
        continue
      }

      if (isUnderlinePanelsPanelSlot(child)) {
        panels.push(child)
      }
    }

    return { tabs, panels }
  })
  const tabs = createMemo(() => parsedChildren().tabs)
  const panels = createMemo(() => parsedChildren().panels)
  const tabsHaveIcons = createMemo(() =>
    tabs().some((tab) => tab.props.icon !== undefined),
  )

  if (isDevelopment()) {
    const selectedTabs = tabs().filter((tab) => isSelected(tab.props['aria-selected']))

    if (selectedTabs.length > 1) {
      throw new Error('Only one tab can be selected at a time.')
    }

    if (tabs().length !== panels().length) {
      throw new Error(
        `The number of tabs and panels must be equal. Counted ${tabs().length} tabs and ${panels().length} panels.`,
      )
    }
  }

  createRenderEffect(() => {
    const currentTabs = tabs()
    const controlledIndex = currentTabs.findIndex((tab) =>
      isSelected(tab.props['aria-selected']),
    )

    setSelectedIndex((current) => {
      if (controlledIndex !== -1) return controlledIndex
      if (currentTabs.length === 0) return 0
      if (current >= currentTabs.length) return 0
      return current
    })
  })

  createRenderEffect(() => {
    tabs()

    if (!tabsHaveIcons()) {
      setIconsVisible(true)
      setFullListWidth(0)
      return
    }

    queueMicrotask(() => {
      const nextWidth = listRef?.getBoundingClientRect().width ?? 0
      const wrapperWidth = wrapperRef?.getBoundingClientRect().width ?? 0

      setFullListWidth(nextWidth)
      if (nextWidth > 0 && wrapperWidth > 0) {
        setIconsVisible(wrapperWidth > nextWidth)
      }
    })
  })

  useResizeObserver(
    (entries) => {
      if (!tabsHaveIcons()) return
      const entry = entries[0]
      const listWidth = fullListWidth()
      if (!entry || listWidth === 0) return
      setIconsVisible(entry.contentRect.width > listWidth)
    },
    () => wrapperRef,
  )

  const focusTab = (index: number) => {
    const tab = tabRefs[index]
    if (tab) tab.focus()
  }

  const selectTab = (index: number) => {
    setSelectedIndex(index)
    queueMicrotask(() => {
      focusTab(index)
    })
  }

  return (
    <>
      <UnderlineWrapper
        as={(local.as ?? 'div') as ValidComponent}
        {...(rest as Record<string, unknown>)}
        ref={(element: unknown) => {
          if (element instanceof HTMLElement) wrapperRef = element
          assignRef(local.ref, element)
        }}
        class={mergeClassNames(
          styles.StyledUnderlineWrapper,
          local.className,
          local.class,
        )}
        id={local.id}
        data-icons-visible={iconsVisible() ? 'true' : 'false'}
      >
        <UnderlineItemList
          ref={(element) => {
            listRef = element
          }}
          aria-label={local['aria-label']}
          aria-labelledby={local['aria-labelledby']}
          role="tablist"
        >
          {tabs().map((tab, index) => {
            const tabId = `${panelGroupId()}-tab-${index}`
            const panelId = `${panelGroupId()}-panel-${index}`

            return (
              <RenderedUnderlinePanelsTab
                index={index}
                totalTabs={tabs().length}
                tabProps={tab.props}
                id={tabId}
                panelId={panelId}
                selected={selectedIndex() === index}
                iconsVisible={iconsVisible()}
                loadingCounters={local.loadingCounters ?? false}
                setTabRef={(element) => {
                  tabRefs[index] = element
                }}
                selectTab={selectTab}
              />
            )
          })}
        </UnderlineItemList>
      </UnderlineWrapper>
      <Show when={panels().length > 0}>
        {panels().map((panel, index) => (
          <RenderedUnderlinePanelsPanel
            panelProps={panel.props}
            id={`${panelGroupId()}-panel-${index}`}
            tabId={`${panelGroupId()}-tab-${index}`}
            selected={selectedIndex() === index}
          />
        ))}
      </Show>
    </>
  )
}

function UnderlinePanelsTab(props: UnderlinePanelsTabProps) {
  return createUnderlinePanelsTabSlot(props)
}

function UnderlinePanelsPanel(props: UnderlinePanelsPanelProps) {
  return createUnderlinePanelsPanelSlot(props)
}

UnderlinePanelsRoot.displayName = 'UnderlinePanels'
UnderlinePanelsTab.displayName = 'UnderlinePanels.Tab'
UnderlinePanelsPanel.displayName = 'UnderlinePanels.Panel'

export const UnderlinePanels = Object.assign(UnderlinePanelsRoot, {
  Tab: UnderlinePanelsTab,
  Panel: UnderlinePanelsPanel,
})

export default UnderlinePanels
