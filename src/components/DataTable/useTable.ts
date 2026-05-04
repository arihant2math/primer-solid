import { createEffect, createMemo, createSignal, untrack } from 'solid-js'
import type { Accessor, JSX } from 'solid-js'
import type { Column } from './column'
import type { UniqueRow } from './row'
import {
  DEFAULT_SORT_DIRECTION,
  SortDirection,
  strategies,
  transition,
} from './sorting'
import type { ObjectPathValue } from './utils'

interface TableConfig<Data extends UniqueRow> {
  columns: Accessor<Array<Column<Data>>>
  data: Accessor<Array<Data>>
  initialSortColumn?: string | number
  initialSortDirection?: Exclude<SortDirection, 'NONE'>
  externalSorting?: Accessor<boolean | undefined>
  getRowId: Accessor<(rowData: Data) => string | number>
}

interface Table<Data extends UniqueRow> {
  headers: Accessor<Array<Header<Data>>>
  rows: Accessor<Array<Row<Data>>>
  actions: {
    sortBy: (header: Header<Data>) => void
  }
  gridTemplateColumns: Accessor<string>
}

interface Header<Data extends UniqueRow> {
  id: string | number
  column: Column<Data>
  isSortable: () => boolean
  getSortDirection: () => SortDirection
}

interface Row<Data extends UniqueRow> {
  id: string | number
  getCells: () => Array<Cell<Data>>
  getValue: () => Data
}

interface Cell<Data extends UniqueRow> {
  id: string
  column: Column<Data>
  getValue: () => Data[keyof Data]
  rowHeader: boolean
}

type ColumnSortState = {
  id: string | number
  direction: Exclude<SortDirection, 'NONE'>
} | null

function isDevelopment() {
  const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV
  return env ? env !== 'production' : false
}

export function useTable<Data extends UniqueRow>({
  columns,
  data,
  initialSortColumn,
  initialSortDirection,
  externalSorting = () => undefined,
  getRowId,
}: TableConfig<Data>): Table<Data> {
  const [sortByColumn, setSortByColumn] = createSignal<ColumnSortState>(
    getInitialSortState(columns(), initialSortColumn, initialSortDirection),
  )

  const headers = createMemo<Array<Header<Data>>>(() => {
    const currentColumns = columns()
    const currentSort = sortByColumn()

    return currentColumns.map((column) => {
      const id = column.id ?? column.field
      if (id === undefined) {
        throw new Error(
          'Expected either an `id` or `field` to be defined for a Column',
        )
      }

      const sortable = column.sortBy !== undefined && column.sortBy !== false

      return {
        id,
        column,
        isSortable() {
          return sortable
        },
        getSortDirection() {
          if (currentSort && currentSort.id === id) {
            return currentSort.direction
          }
          return SortDirection.NONE
        },
      }
    })
  })

  createEffect(() => {
    const currentSort = sortByColumn()
    if (!currentSort) return

    const currentHeaders = headers()
    const hasMatchingHeader = currentHeaders.some((header) => {
      return header.id === currentSort.id
    })

    if (!hasMatchingHeader) {
      setSortByColumn(null)
    }
  })

  const rows = createMemo<Array<Row<Data>>>(() => {
    const currentHeaders = headers()
    const currentSort = sortByColumn()
    const currentData = data()
    const shouldSortExternally = externalSorting()

    const orderedRows = currentSort
      ? sortData(
          currentData,
          currentHeaders,
          currentSort,
          shouldSortExternally,
        )
      : currentData

    return orderedRows.map((row) => {
      const rowId = getRowId()(row)

      return {
        id: `${rowId}`,
        getValue() {
          return row
        },
        getCells() {
          return currentHeaders.map((header) => {
            return {
              id: `${rowId}:${header.id}`,
              column: header.column,
              rowHeader: header.column.rowHeader ?? false,
              getValue() {
                if (header.column.field !== undefined) {
                  return get(row, header.column.field)
                }
                throw new Error(
                  `Unable to get value for column header ${String(header.id)}`,
                )
              },
            }
          })
        },
      }
    })
  })

  function sortBy(header: Header<Data>) {
    const currentSort = untrack(sortByColumn)
    const nextSortState = {
      id: header.id,
      direction:
        currentSort && currentSort.id === header.id
          ? transition(currentSort.direction)
          : DEFAULT_SORT_DIRECTION,
    } satisfies Exclude<ColumnSortState, null>

    setSortByColumn(nextSortState)
  }

  return {
    headers,
    rows,
    actions: {
      sortBy,
    },
    gridTemplateColumns: createMemo(() => {
      return getGridTemplateFromColumns(columns()).join(' ')
    }),
  }
}

function getInitialSortState<Data extends UniqueRow>(
  columns: Array<Column<Data>>,
  initialSortColumn?: string | number,
  initialSortDirection?: Exclude<SortDirection, 'NONE'>,
): ColumnSortState {
  if (initialSortColumn !== undefined) {
    const column = columns.find((column) => {
      return column.id === initialSortColumn || column.field === initialSortColumn
    })

    if (column === undefined) {
      if (isDevelopment()) {
        console.warn(
          `Warning: Unable to find a column with id or field set to: ${String(initialSortColumn)}. Please provide a value to \`initialSortColumn\` which corresponds to a \`id\` or \`field\` value in a column.`,
        )
      }
      return null
    }

    if (column.sortBy === false || column.sortBy === undefined) {
      if (isDevelopment()) {
        console.warn(
          `Warning: The column specified by initialSortColumn={${String(initialSortColumn)}} is not sortable. Please set \`sortBy\` to true or provide a sort strategy.`,
        )
      }
      return null
    }

    return {
      id: initialSortColumn,
      direction: initialSortDirection ?? DEFAULT_SORT_DIRECTION,
    }
  }

  if (initialSortDirection !== undefined) {
    const column = columns.find((column) => {
      return column.sortBy !== false && column.sortBy !== undefined
    })

    if (!column) {
      if (isDevelopment()) {
        console.warn(
          'Warning: An initialSortDirection value was provided but no columns are sortable. Please set `sortBy` to true or provide a sort strategy to a column.',
        )
      }
      return null
    }

    const id = column.id ?? column.field
    if (id === undefined) {
      if (isDevelopment()) {
        console.warn(
          `Warning: Unable to find an \`id\` or \`field\` for the column: ${String(column)}. Please set one of these properties on the column.`,
        )
      }
      return null
    }

    return {
      id,
      direction: initialSortDirection,
    }
  }

  return null
}

function sortData<Data extends UniqueRow>(
  rows: Array<Data>,
  headers: Array<Header<Data>>,
  state: Exclude<ColumnSortState, null>,
  externalSorting?: boolean,
) {
  const header = headers.find((candidate) => {
    return candidate.id === state.id
  })

  if (!header) {
    throw new Error(`Unable to find header with id: ${String(state.id)}`)
  }

  if (header.column.sortBy === false || header.column.sortBy === undefined) {
    throw new Error('The column for this header is not sortable')
  }

  if (externalSorting) {
    return rows
  }

  const sortMethod = (
    header.column.sortBy === true
      ? strategies.basic
      : typeof header.column.sortBy === 'string'
        ? strategies[header.column.sortBy]
        : header.column.sortBy
  ) as (a: unknown, b: unknown) => number

  return rows.slice().sort((a, b) => {
    if (header.column.field === undefined) {
      return 0
    }

    if (typeof header.column.sortBy === 'function') {
      return state.direction === SortDirection.ASC
        ? sortMethod(a, b)
        : sortMethod(b, a)
    }

    const valueA = get(a, header.column.field)
    const valueB = get(b, header.column.field)

    if (valueA && valueB) {
      return state.direction === SortDirection.ASC
        ? sortMethod(valueA, valueB)
        : sortMethod(valueB, valueA)
    }

    if (valueA) return -1
    if (valueB) return 1
    return 0
  })
}

export function getGridTemplateFromColumns<Data extends UniqueRow>(
  columns: Array<Column<Data>>,
): string[] {
  return columns.map((column) => {
    const columnWidth = column.width ?? 'grow'
    let minWidth = 'auto'
    let maxWidth = '1fr'

    if (columnWidth === 'auto') {
      maxWidth = 'auto'
    }

    if (columnWidth === 'grow' && !column.maxWidth) {
      minWidth = 'max-content'
    }

    if (columnWidth === 'growCollapse') {
      minWidth = '0'
    }

    if (column.minWidth) {
      minWidth =
        typeof column.minWidth === 'number'
          ? `${column.minWidth}px`
          : column.minWidth
    }

    if (column.maxWidth) {
      maxWidth =
        typeof column.maxWidth === 'number'
          ? `${column.maxWidth}px`
          : column.maxWidth
    }

    if (
      typeof columnWidth !== 'number' &&
      ['grow', 'growCollapse', 'auto'].includes(columnWidth)
    ) {
      return minWidth === maxWidth ? minWidth : `minmax(${minWidth}, ${maxWidth})`
    }

    return typeof columnWidth === 'number' ? `${columnWidth}px` : columnWidth
  })
}

function get<ObjectType extends Record<string | number, any>, Path extends string>(
  object: ObjectType,
  path: Path,
): ObjectPathValue<ObjectType, Path> {
  return path.split('.').reduce<ObjectPathValue<ObjectType, Path>>(
    (value, key) => {
      return (value as Record<string, unknown>)[key] as ObjectPathValue<
        ObjectType,
        Path
      >
    },
    object as ObjectPathValue<ObjectType, Path>,
  )
}
