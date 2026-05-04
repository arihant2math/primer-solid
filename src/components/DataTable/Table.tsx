import { For, splitProps } from 'solid-js'
import type {
  ComponentProps as SolidComponentProps,
  JSX,
  ValidComponent,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { mergeClassNames, mergeStyles } from '../../utils'
import { assignRef, type RefProp } from '../../utils/solid'
import { SkeletonBox } from '../Skeleton'
import { SortAscIcon, SortDescIcon } from '../Octicon'
import { Text } from '../Text'
import { VisuallyHidden } from '../VisuallyHidden'
import type { CellAlignment, Column } from './column'
import type { UniqueRow } from './row'
import { SortDirection } from './sorting'
import { getGridTemplateFromColumns } from './useTable'
import styles from './Table.module.css'

type DistributiveOmit<T, TOmitted extends PropertyKey> = T extends unknown
  ? Omit<T, TOmitted>
  : never

type TableCellPadding = 'condensed' | 'normal' | 'spacious'

type PolymorphicProps<As extends ValidComponent, OwnProps> =
  DistributiveOmit<SolidComponentProps<As>, keyof OwnProps> & OwnProps

export type TableProps = Omit<
  JSX.HTMLAttributes<HTMLTableElement>,
  'ref' | 'className'
> & {
  'aria-describedby'?: string
  'aria-labelledby'?: string
  children?: JSX.Element
  class?: string
  className?: string
  cellPadding?: TableCellPadding
  gridTemplateColumns?: string | number
  ref?: RefProp<HTMLTableElement>
}

export function TableImpl(props: TableProps) {
  const [local, rest] = splitProps(props, [
    'aria-labelledby',
    'cellPadding',
    'children',
    'class',
    'className',
    'gridTemplateColumns',
    'ref',
    'style',
  ])

  return (
    <div
      aria-labelledby={local['aria-labelledby']}
      class={mergeClassNames('TableOverflowWrapper', styles.TableOverflowWrapper)}
    >
      <table
        {...rest}
        ref={(element) => assignRef(local.ref, element)}
        aria-labelledby={local['aria-labelledby']}
        class={mergeClassNames(local.className, local.class, 'Table', styles.Table)}
        role="table"
        data-component="Table"
        data-cell-padding={local.cellPadding ?? 'normal'}
        style={mergeStyles(
          {
            '--grid-template-columns': local.gridTemplateColumns,
          } as unknown as JSX.CSSProperties,
          local.style,
        )}
      >
        {local.children}
      </table>
    </div>
  )
}

TableImpl.displayName = 'Table'

export type TableHeadProps = Omit<
  JSX.HTMLAttributes<HTMLTableSectionElement>,
  'className'
> & {
  children?: JSX.Element
  class?: string
  className?: string
}

export function TableHead(props: TableHeadProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className'])

  return (
    <thead
      {...rest}
      class={mergeClassNames(local.className, local.class, 'TableHead', styles.TableHead)}
      role="rowgroup"
      data-component="Table.Head"
    >
      {local.children}
    </thead>
  )
}

export type TableBodyProps = Omit<
  JSX.HTMLAttributes<HTMLTableSectionElement>,
  'className'
> & {
  children?: JSX.Element
  class?: string
  className?: string
}

export function TableBody(props: TableBodyProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className'])

  return (
    <tbody
      {...rest}
      class={mergeClassNames(local.className, local.class, 'TableBody', styles.TableBody)}
      role="rowgroup"
      data-component="Table.Body"
    >
      {local.children}
    </tbody>
  )
}

export type TableHeaderProps = Omit<
  JSX.ThHTMLAttributes<HTMLTableHeaderCellElement>,
  'align' | 'className'
> & {
  'data-component'?: string
  align?: CellAlignment
  children?: JSX.Element
  class?: string
  className?: string
}

export function TableHeader(props: TableHeaderProps) {
  const [local, rest] = splitProps(props, [
    'align',
    'children',
    'class',
    'className',
    'data-component',
  ])

  return (
    <th
      {...rest}
      class={mergeClassNames(
        local.className,
        local.class,
        'TableHeader',
        styles.TableHeader,
      )}
      role="columnheader"
      scope="col"
      data-component={local['data-component'] ?? 'Table.Header'}
      data-cell-align={local.align}
    >
      {local.children}
    </th>
  )
}

type TableSortHeaderProps = TableHeaderProps & {
  direction: SortDirection
  onToggleSort: () => void
}

export function TableSortHeader(props: TableSortHeaderProps) {
  const [local, rest] = splitProps(props, [
    'align',
    'children',
    'direction',
    'onToggleSort',
  ])
  const ariaSort =
    local.direction === SortDirection.DESC
      ? 'descending'
      : local.direction === SortDirection.ASC
        ? 'ascending'
        : undefined

  return (
    <TableHeader
      {...rest}
      aria-sort={ariaSort}
      align={local.align}
      data-component="Table.SortHeader"
    >
      <button
        type="button"
        class={mergeClassNames('TableSortButton', styles.TableSortButton)}
        data-component="Table.SortHeader.Button"
        onClick={() => local.onToggleSort()}
      >
        {local.children}
        {local.direction === SortDirection.NONE ||
        local.direction === SortDirection.ASC ? (
          <>
            <SortAscIcon
              class={mergeClassNames(
                'TableSortIcon',
                'TableSortIcon--ascending',
                styles.TableSortIcon,
                styles['TableSortIcon--ascending'],
              )}
            />
            {local.direction === SortDirection.NONE ? (
              <VisuallyHidden>sort ascending</VisuallyHidden>
            ) : null}
          </>
        ) : null}
        {local.direction === SortDirection.DESC ? (
          <SortDescIcon
            class={mergeClassNames(
              'TableSortIcon',
              'TableSortIcon--descending',
              styles.TableSortIcon,
              styles['TableSortIcon--descending'],
            )}
          />
        ) : null}
      </button>
    </TableHeader>
  )
}

export type TableRowProps = Omit<
  JSX.HTMLAttributes<HTMLTableRowElement>,
  'className'
> & {
  children?: JSX.Element
  class?: string
  className?: string
}

export function TableRow(props: TableRowProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className'])

  return (
    <tr
      {...rest}
      class={mergeClassNames(local.className, local.class, 'TableRow', styles.TableRow)}
      role="row"
      data-component="Table.Row"
    >
      {local.children}
    </tr>
  )
}

export type TableCellProps = Omit<
  JSX.TdHTMLAttributes<HTMLTableDataCellElement>,
  'align' | 'className'
> & {
  align?: CellAlignment
  children?: JSX.Element
  class?: string
  className?: string
  scope?: 'row'
}

export function TableCell(props: TableCellProps) {
  const [local, rest] = splitProps(props, [
    'align',
    'children',
    'class',
    'className',
    'scope',
  ])

  if (local.scope) {
    return (
      <th
        {...(rest as Omit<
          JSX.ThHTMLAttributes<HTMLTableHeaderCellElement>,
          'align' | 'className'
        >)}
        class={mergeClassNames(
          local.className,
          local.class,
          'TableCell',
          styles.TableCell,
        )}
        scope={local.scope}
        role="rowheader"
        data-cell-align={local.align}
        data-component="Table.Cell"
      >
        {local.children}
      </th>
    )
  }

  return (
    <td
      {...rest}
      class={mergeClassNames(local.className, local.class, 'TableCell', styles.TableCell)}
      role="cell"
      data-cell-align={local.align}
      data-component="Table.Cell"
    >
      {local.children}
    </td>
  )
}

export type TableCellPlaceholderProps = {
  children?: JSX.Element
}

export function TableCellPlaceholder(props: TableCellPlaceholderProps) {
  return (
    <Text class={styles.PlaceholderText} data-component="Table.CellPlaceholder">
      {props.children}
    </Text>
  )
}

export type TableContainerProps<As extends ValidComponent = 'div'> =
  PolymorphicProps<
    As,
    {
      as?: As
      children?: JSX.Element
      class?: string
      className?: string
    }
  >

export function TableContainer<As extends ValidComponent = 'div'>(
  props: TableContainerProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={local.as ?? 'div'}
      {...(rest as Record<string, unknown>)}
      class={mergeClassNames(
        local.className,
        local.class,
        'TableContainer',
        styles.TableContainer,
      )}
      data-component="Table.Container"
    >
      {local.children}
    </Component>
  )
}

export type TableTitleProps<As extends ValidComponent = 'h2'> = PolymorphicProps<
  As,
  {
    as?: As
    children?: JSX.Element
    class?: string
    className?: string
    id: string
    ref?: RefProp<HTMLElement>
  }
>

export function TableTitle<As extends ValidComponent = 'h2'>(
  props: TableTitleProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'id',
    'ref',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={local.as ?? 'h2'}
      {...(rest as Record<string, unknown>)}
      class={mergeClassNames(local.className, local.class, 'TableTitle', styles.TableTitle)}
      id={local.id}
      ref={(element: unknown) => assignRef(local.ref, element as HTMLElement)}
      data-component="Table.Title"
    >
      {local.children}
    </Component>
  )
}

export type TableSubtitleProps<As extends ValidComponent = 'div'> =
  PolymorphicProps<
    As,
    {
      as?: As
      children?: JSX.Element
      class?: string
      className?: string
      id: string
    }
  >

export function TableSubtitle<As extends ValidComponent = 'div'>(
  props: TableSubtitleProps<As>,
) {
  const [local, rest] = splitProps(props, [
    'as',
    'children',
    'class',
    'className',
    'id',
  ])
  const Component = Dynamic as unknown as (
    componentProps: Record<string, unknown>,
  ) => JSX.Element

  return (
    <Component
      component={local.as ?? 'div'}
      {...(rest as Record<string, unknown>)}
      class={mergeClassNames(
        local.className,
        local.class,
        'TableSubtitle',
        styles.TableSubtitle,
      )}
      id={local.id}
      data-component="Table.Subtitle"
    >
      {local.children}
    </Component>
  )
}

export function TableDivider() {
  return (
    <div
      class={mergeClassNames('TableDivider', styles.TableDivider)}
      role="presentation"
      data-component="Table.Divider"
    />
  )
}

export type TableActionsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, 'className'> & {
  children?: JSX.Element
  class?: string
  className?: string
}

export function TableActions(props: TableActionsProps) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className'])

  return (
    <div
      {...rest}
      class={mergeClassNames(
        local.className,
        local.class,
        'TableActions',
        styles.TableActions,
      )}
      data-component="Table.Actions"
    >
      {local.children}
    </div>
  )
}

function SkeletonText() {
  return <SkeletonBox data-component="SkeletonText" height="0.75rem" />
}

export type TableSkeletonProps<Data extends UniqueRow> = Omit<
  TableProps,
  'children' | 'gridTemplateColumns'
> & {
  cellPadding?: TableCellPadding
  columns: Array<Column<Data>>
  rows?: number
}

export function TableSkeleton<Data extends UniqueRow>(
  props: TableSkeletonProps<Data>,
) {
  const [local, rest] = splitProps(props, ['cellPadding', 'columns', 'rows'])
  const skeletonRows = () => local.rows ?? 10

  return (
    <TableImpl
      {...rest}
      cellPadding={local.cellPadding}
      gridTemplateColumns={getGridTemplateFromColumns(local.columns).join(' ')}
    >
      <TableHead>
        <TableRow>
          <For each={local.columns}>
            {(column, index) => (
              <TableHeader>
                {typeof column.header === 'string'
                  ? column.header
                  : column.header()}
              </TableHeader>
            )}
          </For>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <For each={local.columns}>
            {() => (
              <TableCell
                class={mergeClassNames(
                  'TableCellSkeleton',
                  styles.TableCellSkeleton,
                )}
              >
                <VisuallyHidden>Loading</VisuallyHidden>
                <div
                  class={mergeClassNames(
                    'TableCellSkeletonItems',
                    styles.TableCellSkeletonItems,
                  )}
                >
                  <For each={Array.from({ length: skeletonRows() })}>
                    {() => (
                      <div
                        class={mergeClassNames(
                          'TableCellSkeletonItem',
                          styles.TableCellSkeletonItem,
                        )}
                      >
                        <SkeletonText />
                      </div>
                    )}
                  </For>
                </div>
              </TableCell>
            )}
          </For>
        </TableRow>
      </TableBody>
    </TableImpl>
  )
}

const Table = Object.assign(TableImpl, {
  Container: TableContainer,
  Title: TableTitle,
  Subtitle: TableSubtitle,
  Actions: TableActions,
  Divider: TableDivider,
  Skeleton: TableSkeleton,
  Head: TableHead,
  Body: TableBody,
  Header: TableHeader,
  Row: TableRow,
  Cell: TableCell,
  CellPlaceholder: TableCellPlaceholder,
})

Table.displayName = 'Table'
;(Table as typeof Table & { __SLOT__?: symbol }).__SLOT__ = Symbol('Table')

export { Table }
export default Table
