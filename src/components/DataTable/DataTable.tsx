import { For } from 'solid-js'
import type { JSX } from 'solid-js'
import type { Column } from './column'
import type { UniqueRow } from './row'
import type { SortDirection } from './sorting'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortHeader,
} from './Table'
import { useTable } from './useTable'
import type { ObjectPaths } from './utils'

export type DataTableProps<Data extends UniqueRow> = {
  'aria-describedby'?: string
  'aria-labelledby'?: string
  cellPadding?: 'condensed' | 'normal' | 'spacious'
  data: Array<Data>
  columns: Array<Column<Data>>
  initialSortColumn?: ObjectPaths<Data> | string | number
  initialSortDirection?: Exclude<SortDirection, 'NONE'>
  externalSorting?: boolean
  getRowId?: (rowData: Data) => string | number
  onToggleSort?: (
    columnId: ObjectPaths<Data> | string | number,
    direction: Exclude<SortDirection, 'NONE'>,
  ) => void
}

function defaultGetRowId<D extends UniqueRow>(row: D) {
  return row.id
}

export function DataTable<Data extends UniqueRow>(props: DataTableProps<Data>) {
  const table = useTable<Data>({
    columns: () => props.columns,
    data: () => props.data,
    initialSortColumn: props.initialSortColumn,
    initialSortDirection: props.initialSortDirection,
    externalSorting: () => props.externalSorting,
    getRowId: () => props.getRowId ?? defaultGetRowId<Data>,
  })

  return (
    <Table
      aria-labelledby={props['aria-labelledby']}
      aria-describedby={props['aria-describedby']}
      cellPadding={props.cellPadding}
      gridTemplateColumns={table.gridTemplateColumns()}
    >
      <TableHead>
        <TableRow>
          <For each={table.headers()}>
            {(header) =>
              header.isSortable() ? (
                <TableSortHeader
                  align={header.column.align}
                  direction={header.getSortDirection()}
                  onToggleSort={() => {
                    const nextDirection: Exclude<SortDirection, 'NONE'> =
                      header.getSortDirection() === 'ASC' ? 'DESC' : 'ASC'
                    table.actions.sortBy(header)
                    props.onToggleSort?.(header.id, nextDirection)
                  }}
                >
                  {typeof header.column.header === 'string'
                    ? header.column.header
                    : header.column.header()}
                </TableSortHeader>
              ) : (
                <TableHeader align={header.column.align}>
                  {typeof header.column.header === 'string'
                    ? header.column.header
                    : header.column.header()}
                </TableHeader>
              )
            }
          </For>
        </TableRow>
      </TableHead>
      <TableBody>
        <For each={table.rows()}>
          {(row) => (
            <TableRow>
              <For each={row.getCells()}>
                {(cell) => (
                  <TableCell
                    scope={cell.rowHeader ? 'row' : undefined}
                    align={cell.column.align}
                  >
                    {cell.column.renderCell
                      ? cell.column.renderCell(row.getValue())
                      : ((cell.getValue() ?? '') as JSX.Element)}
                  </TableCell>
                )}
              </For>
            </TableRow>
          )}
        </For>
      </TableBody>
    </Table>
  )
}

DataTable.displayName = 'DataTable'

export default DataTable
