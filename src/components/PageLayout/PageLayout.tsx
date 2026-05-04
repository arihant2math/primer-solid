import {
  children as resolveChildren,
  createContext,
  createMemo,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  type ComponentProps,
  type JSX,
  type ValidComponent,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import {
  getResponsiveAttributes,
  isResponsiveValue,
  mergeClassNames,
  mergeStyles,
  type ResponsiveValue,
} from '../../utils'
import { assignRef, type RefProp } from '../../utils/solid'
import styles from './PageLayout.module.css'
import { removeDraggingStyles, setDraggingStyles } from './paneUtils'
import {
  ARROW_KEY_STEP,
  isCustomWidthOptions,
  isPaneWidth,
  type CustomWidthOptions,
  type PaneWidth,
  type PaneWidthValue,
  updateAriaValues,
  usePaneWidth,
} from './usePaneWidth'
import { useOverflow } from './useOverflow'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

const isArrowKey = (key: string) =>
  key === 'ArrowLeft' ||
  key === 'ArrowRight' ||
  key === 'ArrowUp' ||
  key === 'ArrowDown'
const isShrinkKey = (key: string) =>
  key === 'ArrowLeft' || key === 'ArrowDown'

const SPACING_MAP = {
  none: 0,
  condensed: 3,
  normal: [3, null, null, 4],
} as const

type PageLayoutSpacing = keyof typeof SPACING_MAP
type ContainerWidth = 'full' | 'medium' | 'large' | 'xlarge'
type DividerVariant = 'none' | 'line' | 'filled'
type DividerVariantNoFilled = 'none' | 'line'
type PageLayoutPosition = 'start' | 'end'

type ElementRef<T extends HTMLElement> = { current?: T }

type PageLayoutContextValue = {
  collectSlots: boolean
  padding: PageLayoutSpacing
  rowGap: PageLayoutSpacing
  columnGap: PageLayoutSpacing
  paneRef: ElementRef<HTMLDivElement>
  contentWrapperRef: ElementRef<HTMLDivElement>
  sidebarRef: ElementRef<HTMLDivElement>
  sidebarContentWrapperRef: ElementRef<HTMLDivElement>
}

const PageLayoutContext = createContext<PageLayoutContextValue>()

function createElementRef<T extends HTMLElement>(): ElementRef<T> {
  return { current: undefined }
}

function usePageLayoutContext() {
  const context = useContext(PageLayoutContext)
  const paneRef = createElementRef<HTMLDivElement>()
  const contentWrapperRef = createElementRef<HTMLDivElement>()
  const sidebarRef = createElementRef<HTMLDivElement>()
  const sidebarContentWrapperRef = createElementRef<HTMLDivElement>()

  return {
    collectSlots: context?.collectSlots ?? false,
    padding: context?.padding ?? 'normal',
    rowGap: context?.rowGap ?? 'normal',
    columnGap: context?.columnGap ?? 'normal',
    paneRef: context?.paneRef ?? paneRef,
    contentWrapperRef: context?.contentWrapperRef ?? contentWrapperRef,
    sidebarRef: context?.sidebarRef ?? sidebarRef,
    sidebarContentWrapperRef:
      context?.sidebarContentWrapperRef ?? sidebarContentWrapperRef,
  } satisfies PageLayoutContextValue
}

type PageLayoutSlotType = 'header' | 'content' | 'pane' | 'sidebar' | 'footer'

const PAGE_LAYOUT_SLOT = Symbol('primer-solid.page-layout-slot')

type PageLayoutSlot = {
  readonly [PAGE_LAYOUT_SLOT]: true
  type: PageLayoutSlotType
  props: unknown
}

function createPageLayoutSlot(type: PageLayoutSlotType, props: unknown) {
  return {
    [PAGE_LAYOUT_SLOT]: true,
    type,
    props,
  } as PageLayoutSlot as unknown as JSX.Element
}

function isPageLayoutSlot(value: unknown): value is PageLayoutSlot {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Partial<PageLayoutSlot>)[PAGE_LAYOUT_SLOT] === true
  )
}

function normalizeResponsiveDivider(
  divider: DividerVariantNoFilled | ResponsiveValue<DividerVariant>,
  dividerWhenNarrow: 'inherit' | DividerVariant,
) {
  return !isResponsiveValue(divider) && dividerWhenNarrow !== 'inherit'
    ? { regular: divider, narrow: dividerWhenNarrow }
    : divider
}

function normalizeResponsivePosition(
  position: PageLayoutPosition | ResponsiveValue<PageLayoutPosition>,
  positionWhenNarrow: 'inherit' | PageLayoutPosition,
) {
  return !isResponsiveValue(position) && positionWhenNarrow !== 'inherit'
    ? { regular: position, narrow: positionWhenNarrow }
    : position
}

// ----------------------------------------------------------------------------
// Root

export type PageLayoutProps = {
  children?: JSX.Element
  class?: string
  className?: string
  style?: JSX.CSSProperties | string
  containerWidth?: ContainerWidth
  padding?: PageLayoutSpacing
  rowGap?: PageLayoutSpacing
  columnGap?: PageLayoutSpacing
  _slotsConfig?: Record<'header' | 'footer' | 'sidebar', unknown>
}

function RootWrapper(
  props: Pick<PageLayoutProps, 'children' | 'class' | 'className' | 'style'> & {
    hasSidebar?: boolean
    padding: PageLayoutSpacing
  },
) {
  return (
    <div
      style={mergeStyles(
        {
          '--spacing': `var(--spacing-${props.padding})`,
        },
        props.style,
      )}
      class={mergeClassNames(styles.PageLayoutRoot, props.className, props.class)}
      data-has-sidebar={props.hasSidebar || undefined}
    >
      {props.children}
    </div>
  )
}

function PageLayoutRootBody(props: PageLayoutProps) {
  const [local] = splitProps(props, [
    'children',
    'class',
    'className',
    'columnGap',
    'containerWidth',
    'padding',
    'rowGap',
    'style',
  ])
  const collectingContext = usePageLayoutContext()

  const resolvedChildren = resolveChildren(() => local.children)

  const parsedChildren = createMemo(() => {
    let header: JSX.Element | undefined
    let footer: JSX.Element | undefined
    let sidebar: JSX.Element | undefined
    const rest: JSX.Element[] = []

    for (const child of resolvedChildren.toArray()) {
      if (!isPageLayoutSlot(child)) {
        rest.push(child)
        continue
      }

      switch (child.type) {
        case 'header':
          header = <HeaderRegion {...(child.props as PageLayoutHeaderProps)} />
          break
        case 'footer':
          footer = <FooterRegion {...(child.props as PageLayoutFooterProps)} />
          break
        case 'sidebar':
          sidebar = <SidebarRegion {...(child.props as PageLayoutSidebarProps)} />
          break
        case 'content':
          rest.push(
            <ContentRegion {...(child.props as PageLayoutContentProps)} />,
          )
          break
        case 'pane':
          rest.push(<PaneRegion {...(child.props as PageLayoutPaneProps)} />)
          break
      }
    }

    return { header, footer, sidebar, rest }
  })

  const renderContext = {
    collectSlots: false,
    get padding() {
      return collectingContext.padding
    },
    get rowGap() {
      return collectingContext.rowGap
    },
    get columnGap() {
      return collectingContext.columnGap
    },
    paneRef: collectingContext.paneRef,
    contentWrapperRef: collectingContext.contentWrapperRef,
    sidebarRef: collectingContext.sidebarRef,
    sidebarContentWrapperRef: collectingContext.sidebarContentWrapperRef,
  } satisfies PageLayoutContextValue

  return (
    <PageLayoutContext.Provider value={renderContext}>
      <RootWrapper
        padding={local.padding ?? 'normal'}
        style={local.style}
        class={local.class}
        className={local.className}
        hasSidebar={!!parsedChildren().sidebar}
      >
        {parsedChildren().sidebar}
        <div
          class={styles.PageLayoutWrapper}
          data-width={local.containerWidth ?? 'xlarge'}
        >
          {parsedChildren().header}
          <div class={styles.PageLayoutContent}>{parsedChildren().rest}</div>
          {parsedChildren().footer}
        </div>
      </RootWrapper>
    </PageLayoutContext.Provider>
  )
}

function PageLayoutRoot(props: PageLayoutProps) {
  const [local] = splitProps(props, ['padding', 'rowGap', 'columnGap'])

  const paneRef = createElementRef<HTMLDivElement>()
  const contentWrapperRef = createElementRef<HTMLDivElement>()
  const sidebarRef = createElementRef<HTMLDivElement>()
  const sidebarContentWrapperRef = createElementRef<HTMLDivElement>()

  const contextValue = {
    collectSlots: true,
    get padding() {
      return local.padding ?? 'normal'
    },
    get rowGap() {
      return local.rowGap ?? 'normal'
    },
    get columnGap() {
      return local.columnGap ?? 'normal'
    },
    paneRef,
    contentWrapperRef,
    sidebarRef,
    sidebarContentWrapperRef,
  } satisfies PageLayoutContextValue

  return (
    <PageLayoutContext.Provider value={contextValue}>
      <PageLayoutRootBody {...props} />
    </PageLayoutContext.Provider>
  )
}

// ----------------------------------------------------------------------------
// Dividers

type DividerProps = {
  class?: string
  className?: string
  position?: PageLayoutPosition | ResponsiveValue<PageLayoutPosition>
  style?: JSX.CSSProperties | string
  variant?: DividerVariantNoFilled | DividerVariant | ResponsiveValue<DividerVariant>
}

function HorizontalDivider(props: DividerProps) {
  const context = usePageLayoutContext()

  return (
    <div
      class={mergeClassNames(
        styles.HorizontalDivider,
        props.className,
        props.class,
      )}
      {...getResponsiveAttributes('variant', props.variant ?? 'none')}
      {...getResponsiveAttributes('position', props.position)}
      style={mergeStyles(
        {
          '--spacing-divider': `var(--spacing-${context.padding})`,
        },
        props.style,
      )}
    />
  )
}

type VerticalDividerProps = DividerProps & {
  children?: JSX.Element
}

function VerticalDivider(props: VerticalDividerProps) {
  return (
    <div
      class={mergeClassNames(
        styles.VerticalDivider,
        props.className,
        props.class,
      )}
      {...getResponsiveAttributes('variant', props.variant ?? 'none')}
      {...getResponsiveAttributes('position', props.position)}
      style={props.style}
    >
      {props.children}
    </div>
  )
}

type SidebarDividerProps = {
  position: 'start' | 'end'
  divider: 'none' | 'line'
  resizable: boolean
  minPaneWidth: number
  maxPaneWidth: number
  currentWidth: number
  currentWidthRef: { current: number }
  handleRef: ElementRef<HTMLDivElement>
  sidebarRef: ElementRef<HTMLDivElement>
  dragStartClientXRef: { current: number }
  dragStartWidthRef: { current: number }
  dragMaxWidthRef: { current: number }
  getMaxPaneWidth: () => number
  getDefaultWidth: () => number
  saveWidth: (width: number) => void
}

function SidebarDivider(props: SidebarDividerProps) {
  const context = usePageLayoutContext()

  return (
    <VerticalDivider
      variant={props.resizable ? 'line' : props.divider}
      position={props.position}
      class={styles.SidebarVerticalDivider}
      style={{ '--spacing-column': `var(--spacing-${context.columnGap})` }}
    >
      {props.resizable ? (
        <DragHandle
          handleRef={props.handleRef}
          aria-valuemin={props.minPaneWidth}
          aria-valuemax={props.maxPaneWidth}
          aria-valuenow={props.currentWidth}
          onDragStart={(clientX) => {
            props.dragStartClientXRef.current = clientX
            props.dragStartWidthRef.current =
              props.sidebarRef.current?.getBoundingClientRect().width ??
              props.currentWidthRef.current
            props.dragMaxWidthRef.current = props.getMaxPaneWidth()
          }}
          onDrag={(value, isKeyboard) => {
            const maxWidth = isKeyboard
              ? props.getMaxPaneWidth()
              : props.dragMaxWidthRef.current

            if (isKeyboard) {
              const delta = props.position === 'end' ? -value : value
              const nextWidth = Math.max(
                props.minPaneWidth,
                Math.min(maxWidth, props.currentWidthRef.current + delta),
              )

              if (nextWidth !== props.currentWidthRef.current) {
                props.currentWidthRef.current = nextWidth
                props.sidebarRef.current?.style.setProperty(
                  '--pane-width',
                  `${nextWidth}px`,
                )
                updateAriaValues(props.handleRef.current, {
                  current: nextWidth,
                  max: maxWidth,
                })
              }
              return
            }

            const sidebar = props.sidebarRef.current
            if (!sidebar) return

            const deltaX = value - props.dragStartClientXRef.current
            const directedDelta = props.position === 'end' ? -deltaX : deltaX
            const nextWidth = props.dragStartWidthRef.current + directedDelta
            const clampedWidth = Math.max(
              props.minPaneWidth,
              Math.min(maxWidth, nextWidth),
            )

            if (
              Math.round(clampedWidth) !==
              Math.round(props.currentWidthRef.current)
            ) {
              sidebar.style.setProperty('--pane-width', `${clampedWidth}px`)
              props.currentWidthRef.current = clampedWidth
              updateAriaValues(props.handleRef.current, {
                current: Math.round(clampedWidth),
                max: maxWidth,
              })
            }
          }}
          onDragEnd={() => {
            props.saveWidth(props.currentWidthRef.current)
          }}
          onDoubleClick={() => {
            const resetWidth = props.getDefaultWidth()
            props.sidebarRef.current?.style.setProperty(
              '--pane-width',
              `${resetWidth}px`,
            )
            props.currentWidthRef.current = resetWidth
            updateAriaValues(props.handleRef.current, { current: resetWidth })
            props.saveWidth(resetWidth)
          }}
        />
      ) : null}
    </VerticalDivider>
  )
}

type DragHandleProps = {
  handleRef: ElementRef<HTMLDivElement>
  onDragStart: (clientX: number) => void
  onDrag: (value: number, isKeyboard: boolean) => void
  onDragEnd: () => void
  onDoubleClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>
  'aria-valuemin'?: number
  'aria-valuemax'?: number
  'aria-valuenow'?: number
}

function DragHandle(props: DragHandleProps) {
  const context = usePageLayoutContext()
  const isDraggingRef = { current: false }
  const rafIdRef = { current: null as number | null }
  const pendingClientXRef = { current: null as number | null }

  const startDragging = () => {
    if (isDraggingRef.current) return
    setDraggingStyles({
      handle: props.handleRef.current ?? null,
      pane: context.paneRef.current ?? null,
      contentWrapper: context.contentWrapperRef.current ?? null,
    })
    isDraggingRef.current = true
  }

  const endDragging = () => {
    if (!isDraggingRef.current) return
    removeDraggingStyles({
      handle: props.handleRef.current ?? null,
      pane: context.paneRef.current ?? null,
      contentWrapper: context.contentWrapperRef.current ?? null,
    })
    isDraggingRef.current = false
  }

  onCleanup(() => {
    if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
  })

  return (
    <div
      ref={(element) => assignRef(props.handleRef, element)}
      class={styles.DraggableHandle}
      role="slider"
      aria-label="Draggable pane splitter"
      aria-valuemin={props['aria-valuemin']}
      aria-valuemax={props['aria-valuemax']}
      aria-valuenow={props['aria-valuenow']}
      aria-valuetext={
        props['aria-valuenow'] !== undefined
          ? `Pane width ${props['aria-valuenow']} pixels`
          : undefined
      }
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.preventDefault()
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // ignore
        }
        props.onDragStart(event.clientX)
        startDragging()
      }}
      onPointerMove={(event) => {
        if (!isDraggingRef.current) return
        event.preventDefault()
        pendingClientXRef.current = event.clientX

        if (rafIdRef.current === null) {
          rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null
            if (pendingClientXRef.current !== null) {
              props.onDrag(pendingClientXRef.current, false)
              pendingClientXRef.current = null
            }
          })
        }
      }}
      onPointerUp={(event) => {
        if (!isDraggingRef.current) return
        event.preventDefault()
      }}
      onLostPointerCapture={() => {
        if (!isDraggingRef.current) return
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current)
          rafIdRef.current = null
          pendingClientXRef.current = null
        }
        endDragging()
        props.onDragEnd()
      }}
      onKeyDown={(event) => {
        if (!isArrowKey(event.key)) return
        event.preventDefault()

        const delta = isShrinkKey(event.key)
          ? -ARROW_KEY_STEP
          : ARROW_KEY_STEP

        if (!isDraggingRef.current) startDragging()
        props.onDrag(delta, true)
      }}
      onKeyUp={(event) => {
        if (!isArrowKey(event.key)) return
        event.preventDefault()
        endDragging()
        props.onDragEnd()
      }}
      onDblClick={props.onDoubleClick}
    />
  )
}

// ----------------------------------------------------------------------------
// Header

export type PageLayoutHeaderProps = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  'children' | 'className'
> & {
  children?: JSX.Element
  class?: string
  className?: string
  padding?: PageLayoutSpacing
  divider?: DividerVariantNoFilled | ResponsiveValue<DividerVariant>
  dividerWhenNarrow?: 'inherit' | DividerVariant
  hidden?: boolean | ResponsiveValue<boolean>
}

function HeaderRegion(props: PageLayoutHeaderProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'divider',
    'dividerWhenNarrow',
    'hidden',
    'padding',
    'style',
  ])
  const context = usePageLayoutContext()

  const dividerProp = createMemo(() =>
    normalizeResponsiveDivider(
      local.divider ?? 'none',
      local.dividerWhenNarrow ?? 'inherit',
    ),
  )

  return (
    <header
      {...rest}
      {...getResponsiveAttributes('hidden', local.hidden ?? false)}
      class={mergeClassNames(styles.Header, local.className, local.class)}
      style={mergeStyles(
        {
          '--spacing': `var(--spacing-${context.rowGap})`,
        },
        local.style,
      )}
    >
      <div
        class={styles.HeaderContent}
        style={{ '--spacing': `var(--spacing-${local.padding ?? 'none'})` }}
      >
        {local.children}
      </div>
      <HorizontalDivider
        variant={dividerProp()}
        class={styles.HeaderHorizontalDivider}
        style={{ '--spacing': `var(--spacing-${context.rowGap})` }}
      />
    </header>
  )
}

function PageLayoutHeader(props: PageLayoutHeaderProps) {
  const context = usePageLayoutContext()
  return context.collectSlots
    ? createPageLayoutSlot('header', props)
    : <HeaderRegion {...props} />
}

// ----------------------------------------------------------------------------
// Content

type PageLayoutContentOwnProps<As extends ValidComponent> = {
  as?: As
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<HTMLElement>
  width?: ContainerWidth
  padding?: PageLayoutSpacing
  hidden?: boolean | ResponsiveValue<boolean>
}

export type PageLayoutContentProps<As extends ValidComponent = 'main'> =
  DistributiveOmit<
    ComponentProps<As>,
    keyof PageLayoutContentOwnProps<As> | 'className'
  > &
    PageLayoutContentOwnProps<As>

function ContentRegion<As extends ValidComponent = 'main'>(
  props: PageLayoutContentProps<As>,
) {
  const [local, rest] = splitProps(props as PageLayoutContentProps, [
    'as',
    'children',
    'class',
    'className',
    'hidden',
    'padding',
    'ref',
    'style',
    'width',
  ])
  const context = usePageLayoutContext()

  return (
    <Dynamic
      component={local.as ?? 'main'}
      {...rest}
      ref={(element: unknown) => {
        const resolved = element as HTMLElement
        context.contentWrapperRef.current = resolved as HTMLDivElement
        assignRef(local.ref, resolved)
      }}
      class={mergeClassNames(
        styles.ContentWrapper,
        local.className,
        local.class,
      )}
      {...getResponsiveAttributes('is-hidden', local.hidden ?? false)}
      style={local.style}
    >
      <div
        class={styles.Content}
        data-width={local.width ?? 'full'}
        style={{ '--spacing': `var(--spacing-${local.padding ?? 'none'})` }}
      >
        {local.children}
      </div>
    </Dynamic>
  )
}

function PageLayoutContent<As extends ValidComponent = 'main'>(
  props: PageLayoutContentProps<As>,
) {
  const context = usePageLayoutContext()
  return context.collectSlots
    ? createPageLayoutSlot('content', props)
    : <ContentRegion {...props} />
}

// ----------------------------------------------------------------------------
// Pane

export type PageLayoutPaneBaseProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'ref'
> & {
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<HTMLDivElement>
  position?: PageLayoutPosition | ResponsiveValue<PageLayoutPosition>
  positionWhenNarrow?: 'inherit' | PageLayoutPosition
  width?: PaneWidthValue
  minWidth?: number
  widthStorageKey?: string
  padding?: PageLayoutSpacing
  divider?: DividerVariantNoFilled | ResponsiveValue<DividerVariant>
  dividerWhenNarrow?: 'inherit' | DividerVariant
  sticky?: boolean
  offsetHeader?: string | number
  hidden?: boolean | ResponsiveValue<boolean>
  resizable?: boolean
}

export type PageLayoutPaneProps = PageLayoutPaneBaseProps &
  (
    | {
        onResizeEnd: (width: number) => void
        currentWidth: number | undefined
      }
    | {
        onResizeEnd?: never
        currentWidth?: never
      }
  )

function PaneRegion(props: PageLayoutPaneProps) {
  const [local, rest] = splitProps(props, [
    'aria-label',
    'aria-labelledby',
    'children',
    'class',
    'className',
    'currentWidth',
    'divider',
    'dividerWhenNarrow',
    'hidden',
    'minWidth',
    'offsetHeader',
    'onResizeEnd',
    'padding',
    'position',
    'positionWhenNarrow',
    'ref',
    'resizable',
    'sticky',
    'style',
    'width',
    'widthStorageKey',
  ])
  const context = usePageLayoutContext()
  const handleRef = createElementRef<HTMLDivElement>()
  const dragStartClientXRef = { current: 0 }
  const dragStartWidthRef = { current: 0 }
  const dragMaxWidthRef = { current: 0 }

  const positionProp = createMemo(() =>
    normalizeResponsivePosition(
      local.position ?? 'end',
      local.positionWhenNarrow ?? 'inherit',
    ),
  )
  const dividerProp = createMemo(() =>
    normalizeResponsiveDivider(
      local.divider ?? 'none',
      local.dividerWhenNarrow ?? 'inherit',
    ),
  )
  const position = createMemo<PageLayoutPosition>(() => {
    const value = positionProp()
    return isResponsiveValue(value) ? 'end' : value
  })
  const dividerVariant = createMemo<DividerVariantNoFilled>(() => {
    const value = dividerProp()
    return isResponsiveValue(value) ? 'none' : value
  })

  const paneWidth = usePaneWidth({
    width: () => local.width ?? 'medium',
    minWidth: () => local.minWidth ?? 256,
    resizable: () => local.resizable ?? false,
    widthStorageKey: () => local.widthStorageKey ?? 'paneWidth',
    paneRef: context.paneRef,
    handleRef,
    contentWrapperRef: context.contentWrapperRef,
    onResizeEnd: () => local.onResizeEnd,
    currentWidth: () => local.currentWidth,
  })

  const hasOverflow = useOverflow(context.paneRef)

  return (
    <div
      class={mergeClassNames(styles.PaneWrapper, local.className, local.class)}
      style={mergeStyles(
        {
          '--offset-header':
            typeof local.offsetHeader === 'number'
              ? `${local.offsetHeader}px`
              : (local.offsetHeader ?? 0),
          '--spacing-row': `var(--spacing-${context.rowGap})`,
          '--spacing-column': `var(--spacing-${context.columnGap})`,
        },
        local.style,
      )}
      {...getResponsiveAttributes('is-hidden', local.hidden ?? false)}
      {...getResponsiveAttributes('position', positionProp())}
      data-sticky={local.sticky || undefined}
    >
      <HorizontalDivider
        variant={
          isResponsiveValue(dividerProp())
            ? dividerProp()
            : { narrow: dividerVariant(), regular: 'none' }
        }
        class={styles.PaneHorizontalDivider}
        style={{ '--spacing': `var(--spacing-${context.rowGap})` }}
        position={positionProp()}
      />
      <div
        {...rest}
        ref={(element) => {
          context.paneRef.current = element
          assignRef(local.ref, element)
        }}
        role={hasOverflow() ? 'region' : undefined}
        tabIndex={hasOverflow() ? 0 : undefined}
        aria-label={hasOverflow() ? local['aria-label'] : undefined}
        aria-labelledby={hasOverflow() ? local['aria-labelledby'] : undefined}
        class={styles.Pane}
        data-resizable={local.resizable || undefined}
        style={{
          '--spacing': `var(--spacing-${local.padding ?? 'none'})`,
          '--pane-min-width': isCustomWidthOptions(local.width ?? 'medium')
            ? (local.width as CustomWidthOptions).min
            : `${local.minWidth ?? 256}px`,
          '--pane-max-width': isCustomWidthOptions(local.width ?? 'medium')
            ? (local.width as CustomWidthOptions).max
            : 'calc(100vw - var(--pane-max-width-diff))',
          '--pane-width-custom': isCustomWidthOptions(local.width ?? 'medium')
            ? (local.width as CustomWidthOptions).default
            : undefined,
          '--pane-width-size': `var(--pane-width-${isPaneWidth(local.width ?? 'medium') ? (local.width ?? 'medium') : 'custom'})`,
          '--pane-width': `${paneWidth.currentWidth}px`,
        }}
      >
        {local.children}
      </div>
      <VerticalDivider
        variant={(() => {
          const divider = dividerProp()
          if (isResponsiveValue(divider)) {
            return {
              narrow: 'none',
              regular: local.resizable ? 'line' : divider.regular || 'none',
              wide: local.resizable
                ? 'line'
                : divider.wide || divider.regular || 'none',
            } satisfies ResponsiveValue<DividerVariant>
          }

          return {
            narrow: 'none',
            regular: local.resizable ? 'line' : dividerVariant(),
          } satisfies ResponsiveValue<DividerVariant>
        })()}
        position={positionProp()}
        class={styles.PaneVerticalDivider}
        style={{ '--spacing': `var(--spacing-${context.columnGap})` }}
      >
        {local.resizable ? (
          <DragHandle
            handleRef={handleRef}
            aria-valuemin={paneWidth.minPaneWidth}
            aria-valuemax={paneWidth.maxPaneWidth}
            aria-valuenow={paneWidth.currentWidth}
            onDragStart={(clientX) => {
              dragStartClientXRef.current = clientX
              dragStartWidthRef.current =
                context.paneRef.current?.getBoundingClientRect().width ??
                paneWidth.currentWidthRef.current
              dragMaxWidthRef.current = paneWidth.getMaxPaneWidth()
            }}
            onDrag={(value, isKeyboard) => {
              const maxWidth = isKeyboard
                ? paneWidth.getMaxPaneWidth()
                : dragMaxWidthRef.current

              if (isKeyboard) {
                const nextWidth = Math.max(
                  paneWidth.minPaneWidth,
                  Math.min(
                    maxWidth,
                    paneWidth.currentWidthRef.current + value,
                  ),
                )

                if (nextWidth !== paneWidth.currentWidthRef.current) {
                  paneWidth.currentWidthRef.current = nextWidth
                  context.paneRef.current?.style.setProperty(
                    '--pane-width',
                    `${nextWidth}px`,
                  )
                  updateAriaValues(handleRef.current, {
                    current: nextWidth,
                    max: maxWidth,
                  })
                }
                return
              }

              const pane = context.paneRef.current
              if (!pane) return

              const deltaX = value - dragStartClientXRef.current
              const directedDelta = position() === 'end' ? -deltaX : deltaX
              const nextWidth = dragStartWidthRef.current + directedDelta
              const clampedWidth = Math.max(
                paneWidth.minPaneWidth,
                Math.min(maxWidth, nextWidth),
              )

              if (
                Math.round(clampedWidth) !==
                Math.round(paneWidth.currentWidthRef.current)
              ) {
                pane.style.setProperty('--pane-width', `${clampedWidth}px`)
                paneWidth.currentWidthRef.current = clampedWidth
                updateAriaValues(handleRef.current, {
                  current: Math.round(clampedWidth),
                  max: maxWidth,
                })
              }
            }}
            onDragEnd={() => {
              paneWidth.saveWidth(paneWidth.currentWidthRef.current)
            }}
            onDoubleClick={() => {
              const resetWidth = paneWidth.getDefaultWidth()
              context.paneRef.current?.style.setProperty(
                '--pane-width',
                `${resetWidth}px`,
              )
              paneWidth.currentWidthRef.current = resetWidth
              updateAriaValues(handleRef.current, { current: resetWidth })
              paneWidth.saveWidth(resetWidth)
            }}
          />
        ) : null}
      </VerticalDivider>
    </div>
  )
}

function PageLayoutPane(props: PageLayoutPaneProps) {
  const context = usePageLayoutContext()
  return context.collectSlots
    ? createPageLayoutSlot('pane', props)
    : <PaneRegion {...props} />
}

// ----------------------------------------------------------------------------
// Sidebar

export type PageLayoutSidebarProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'className' | 'ref'
> & {
  children?: JSX.Element
  class?: string
  className?: string
  ref?: RefProp<HTMLDivElement>
  position?: 'start' | 'end'
  width?: PaneWidth | CustomWidthOptions
  minWidth?: number
  resizable?: boolean
  widthStorageKey?: string
  padding?: PageLayoutSpacing
  divider?: 'none' | 'line'
  sticky?: boolean
  responsiveVariant?: 'default' | 'fullscreen'
  hidden?: boolean | ResponsiveValue<boolean>
}

function SidebarRegion(props: PageLayoutSidebarProps) {
  const [local, rest] = splitProps(props, [
    'aria-label',
    'aria-labelledby',
    'children',
    'class',
    'className',
    'divider',
    'hidden',
    'minWidth',
    'padding',
    'position',
    'ref',
    'resizable',
    'responsiveVariant',
    'sticky',
    'style',
    'width',
    'widthStorageKey',
  ])
  const context = usePageLayoutContext()
  const handleRef = createElementRef<HTMLDivElement>()
  const dragStartClientXRef = { current: 0 }
  const dragStartWidthRef = { current: 0 }
  const dragMaxWidthRef = { current: 0 }

  const paneWidth = usePaneWidth({
    width: () => local.width ?? 'medium',
    minWidth: () => local.minWidth ?? 256,
    resizable: () => local.resizable ?? false,
    widthStorageKey: () => local.widthStorageKey,
    paneRef: context.sidebarRef,
    handleRef,
    contentWrapperRef: context.sidebarContentWrapperRef,
    constrainToViewport: () => true,
  })

  const hasOverflow = useOverflow(context.sidebarRef)

  return (
    <div
      class={mergeClassNames(
        styles.SidebarWrapper,
        local.className,
        local.class,
      )}
      style={mergeStyles(
        {
          '--spacing-column': `var(--spacing-${context.columnGap})`,
        },
        local.style,
      )}
      {...getResponsiveAttributes('is-hidden', local.hidden ?? false)}
      data-position={local.position ?? 'start'}
      data-sticky={local.sticky || undefined}
      data-responsive-variant={
        local.responsiveVariant && local.responsiveVariant !== 'default'
          ? local.responsiveVariant
          : undefined
      }
    >
      {(local.position ?? 'start') === 'end' ? (
        <SidebarDivider
          position="end"
          divider={local.divider ?? 'none'}
          resizable={local.resizable ?? false}
          minPaneWidth={paneWidth.minPaneWidth}
          maxPaneWidth={paneWidth.maxPaneWidth}
          currentWidth={paneWidth.currentWidth}
          currentWidthRef={paneWidth.currentWidthRef}
          handleRef={handleRef}
          sidebarRef={context.sidebarRef}
          dragStartClientXRef={dragStartClientXRef}
          dragStartWidthRef={dragStartWidthRef}
          dragMaxWidthRef={dragMaxWidthRef}
          getMaxPaneWidth={paneWidth.getMaxPaneWidth}
          getDefaultWidth={paneWidth.getDefaultWidth}
          saveWidth={paneWidth.saveWidth}
        />
      ) : null}
      <div
        {...rest}
        ref={(element) => {
          context.sidebarRef.current = element
          assignRef(local.ref, element)
        }}
        role={hasOverflow() ? 'region' : undefined}
        tabIndex={hasOverflow() ? 0 : undefined}
        aria-label={hasOverflow() ? local['aria-label'] : undefined}
        aria-labelledby={hasOverflow() ? local['aria-labelledby'] : undefined}
        class={styles.Sidebar}
        data-resizable={local.resizable || undefined}
        style={{
          '--spacing': `var(--spacing-${local.padding ?? 'none'})`,
          '--pane-min-width': isCustomWidthOptions(local.width ?? 'medium')
            ? (local.width as CustomWidthOptions).min
            : `${local.minWidth ?? 256}px`,
          '--pane-max-width': isCustomWidthOptions(local.width ?? 'medium')
            ? (local.width as CustomWidthOptions).max
            : 'calc(100vw - var(--sidebar-max-width-diff))',
          '--pane-width-custom': isCustomWidthOptions(local.width ?? 'medium')
            ? (local.width as CustomWidthOptions).default
            : undefined,
          '--pane-width-size': `var(--pane-width-${isPaneWidth(local.width ?? 'medium') ? (local.width ?? 'medium') : 'custom'})`,
          '--pane-width': `${paneWidth.currentWidth}px`,
        }}
      >
        {local.children}
      </div>
      {(local.position ?? 'start') === 'start' ? (
        <SidebarDivider
          position="start"
          divider={local.divider ?? 'none'}
          resizable={local.resizable ?? false}
          minPaneWidth={paneWidth.minPaneWidth}
          maxPaneWidth={paneWidth.maxPaneWidth}
          currentWidth={paneWidth.currentWidth}
          currentWidthRef={paneWidth.currentWidthRef}
          handleRef={handleRef}
          sidebarRef={context.sidebarRef}
          dragStartClientXRef={dragStartClientXRef}
          dragStartWidthRef={dragStartWidthRef}
          dragMaxWidthRef={dragMaxWidthRef}
          getMaxPaneWidth={paneWidth.getMaxPaneWidth}
          getDefaultWidth={paneWidth.getDefaultWidth}
          saveWidth={paneWidth.saveWidth}
        />
      ) : null}
    </div>
  )
}

function PageLayoutSidebar(props: PageLayoutSidebarProps) {
  const context = usePageLayoutContext()
  return context.collectSlots
    ? createPageLayoutSlot('sidebar', props)
    : <SidebarRegion {...props} />
}

// ----------------------------------------------------------------------------
// Footer

export type PageLayoutFooterProps = Omit<
  JSX.HTMLAttributes<HTMLElement>,
  'children' | 'className'
> & {
  children?: JSX.Element
  class?: string
  className?: string
  padding?: PageLayoutSpacing
  divider?: DividerVariantNoFilled | ResponsiveValue<DividerVariant>
  dividerWhenNarrow?: 'inherit' | DividerVariant
  hidden?: boolean | ResponsiveValue<boolean>
}

function FooterRegion(props: PageLayoutFooterProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'class',
    'className',
    'divider',
    'dividerWhenNarrow',
    'hidden',
    'padding',
    'style',
  ])
  const context = usePageLayoutContext()

  const dividerProp = createMemo(() =>
    normalizeResponsiveDivider(
      local.divider ?? 'none',
      local.dividerWhenNarrow ?? 'inherit',
    ),
  )

  return (
    <footer
      {...rest}
      {...getResponsiveAttributes('hidden', local.hidden ?? false)}
      class={mergeClassNames(
        styles.FooterWrapper,
        local.className,
        local.class,
      )}
      style={mergeStyles(
        {
          '--spacing': `var(--spacing-${context.rowGap})`,
        },
        local.style,
      )}
    >
      <HorizontalDivider
        class={styles.FooterHorizontalDivider}
        style={{ '--spacing': `var(--spacing-${context.rowGap})` }}
        variant={dividerProp()}
      />
      <div
        class={styles.FooterContent}
        style={{ '--spacing': `var(--spacing-${local.padding ?? 'none'})` }}
      >
        {local.children}
      </div>
    </footer>
  )
}

function PageLayoutFooter(props: PageLayoutFooterProps) {
  const context = usePageLayoutContext()
  return context.collectSlots
    ? createPageLayoutSlot('footer', props)
    : <FooterRegion {...props} />
}

// ----------------------------------------------------------------------------
// Export

type PageLayoutSlotComponent<Props> = ((props: Props) => JSX.Element) & {
  __SLOT__?: symbol
}

type PageLayoutContentComponent = typeof PageLayoutContent & { __SLOT__?: symbol }
type PageLayoutPaneComponent = typeof PageLayoutPane & { __SLOT__?: symbol }
type PageLayoutSidebarComponent = typeof PageLayoutSidebar & { __SLOT__?: symbol }

export const PageLayout = Object.assign(PageLayoutRoot, {
  __SLOT__: Symbol('PageLayout'),
  Header: PageLayoutHeader as PageLayoutSlotComponent<PageLayoutHeaderProps>,
  Content: PageLayoutContent as PageLayoutContentComponent,
  Pane: PageLayoutPane as PageLayoutPaneComponent,
  Sidebar: PageLayoutSidebar as PageLayoutSidebarComponent,
  Footer: PageLayoutFooter as PageLayoutSlotComponent<PageLayoutFooterProps>,
})

PageLayout.Header.__SLOT__ = Symbol('PageLayout.Header')
PageLayout.Content.__SLOT__ = Symbol('PageLayout.Content')
PageLayout.Pane.__SLOT__ = Symbol('PageLayout.Pane')
PageLayout.Sidebar.__SLOT__ = Symbol('PageLayout.Sidebar')
PageLayout.Footer.__SLOT__ = Symbol('PageLayout.Footer')
