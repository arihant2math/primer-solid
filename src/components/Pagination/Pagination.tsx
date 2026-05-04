import { For, createMemo, splitProps, type ComponentProps, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames } from '../../utils'
import type { ResponsiveValue } from '../../utils'
import { ChevronLeftIcon, ChevronRightIcon } from '../Octicon'
import {
  buildComponentData,
  buildPaginationModel,
  type PageDataProps,
} from './model'
import styles from './Pagination.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

const viewportNames = ['narrow', 'regular', 'wide'] as const

type PaginationOwnProps = {
  class?: string
  /** React compatibility alias. Prefer `class` in Solid code. */
  className?: string
  pageCount: number
  currentPage: number
  onPageChange?: (event: MouseEvent, pageNumber: number) => void
  hrefBuilder?: (pageNumber: number) => string
  marginPageCount?: number
  showPages?: boolean | ResponsiveValue<boolean>
  surroundingPageCount?: number
  renderPage?: (props: PageProps) => JSX.Element
}

export type PaginationProps = DistributiveOmit<
  ComponentProps<'nav'>,
  keyof PaginationOwnProps | 'className'
> &
  PaginationOwnProps

export type PageProps = {
  key: string
  children: JSX.Element
  number: number
  class?: string
  className: string
  'data-component': 'Pagination.Page'
} & Omit<PageDataProps['props'], 'as' | 'role'>

function getViewportRangesToHidePages(
  showPages: PaginationProps['showPages'],
) {
  if (showPages === false) {
    return [...viewportNames]
  }

  if (showPages === true || showPages === undefined) {
    return []
  }

  if (!showPages || typeof showPages !== 'object') {
    return []
  }

  const hiddenRanges: Array<(typeof viewportNames)[number]> = []
  const showNarrow = showPages.narrow ?? true
  const showRegular = showPages.regular ?? true
  const showWide = showPages.wide ?? showPages.regular ?? true

  if (!showNarrow) hiddenRanges.push('narrow')
  if (!showRegular) hiddenRanges.push('regular')
  if (!showWide) hiddenRanges.push('wide')

  return hiddenRanges
}

function PageLabel(props: {
  children: JSX.Element
  direction?: 'page-prev' | 'page-next' | string
}) {
  return (
    <>
      {props.direction === 'page-prev' ? (
        <span data-component="Pagination.PreviousPageIcon">
          <ChevronLeftIcon />
        </span>
      ) : null}
      {props.children}
      {props.direction === 'page-next' ? (
        <span data-component="Pagination.NextPageIcon">
          <ChevronRightIcon />
        </span>
      ) : null}
    </>
  )
}

export function Pagination(props: PaginationProps) {
  const [local, rest] = splitProps(props, [
    'aria-label',
    'class',
    'className',
    'currentPage',
    'hrefBuilder',
    'marginPageCount',
    'onPageChange',
    'pageCount',
    'renderPage',
    'showPages',
    'surroundingPageCount',
  ])

  const hrefBuilder = () => local.hrefBuilder ?? defaultHrefBuilder
  const onPageChange = () => local.onPageChange ?? noop
  const marginPageCount = () => local.marginPageCount ?? 1
  const showPages = () => local.showPages ?? true
  const surroundingPageCount = () => local.surroundingPageCount ?? 2

  const model = createMemo(() =>
    buildPaginationModel(
      local.pageCount,
      local.currentPage,
      !!showPages(),
      marginPageCount(),
      surroundingPageCount(),
    ),
  )

  const hiddenViewportRanges = createMemo(() =>
    getViewportRangesToHidePages(showPages()).join(' '),
  )

  return (
    <nav
      {...rest}
      class={mergeClassNames(
        styles.PaginationContainer,
        local.className,
        local.class,
      )}
      aria-label={local['aria-label'] ?? 'Pagination'}
      data-component="Pagination"
    >
      <div
        class={styles.TablePaginationSteps}
        data-hidden-viewport-ranges={hiddenViewportRanges()}
      >
        <For each={model()}>
          {(page) => {
            const pageData = buildComponentData(
              page,
              hrefBuilder(),
              (event) => onPageChange()(event, page.num),
            )
            const pageLabel = (
              <PageLabel direction={pageData.key}>{pageData.content}</PageLabel>
            )

            if (local.renderPage && pageData.props.as !== 'span') {
              return local.renderPage({
                key: pageData.key,
                children: pageLabel,
                number: page.num,
                class: styles.Page,
                className: styles.Page,
                'data-component': 'Pagination.Page',
                ...pageData.props,
              })
            }

            const dataComponentAttribute =
              pageData.props.rel === 'prev'
                ? 'Pagination.PreviousPage'
                : pageData.props.rel === 'next'
                  ? 'Pagination.NextPage'
                  : 'Pagination.Page'
            const Component = (pageData.props.as ?? 'a') as 'a' | 'span'

            return (
              <Dynamic
                component={Component}
                class={styles.Page}
                data-component={dataComponentAttribute}
                {...pageData.props}
              >
                {pageLabel}
              </Dynamic>
            )
          }}
        </For>
      </div>
    </nav>
  )
}

function defaultHrefBuilder(pageNumber: number) {
  return `#${pageNumber}`
}

function noop() {}

export default Pagination
