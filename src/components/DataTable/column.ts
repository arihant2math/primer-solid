import type { JSX } from 'solid-js'
import type { ObjectPaths } from './utils'
import type { UniqueRow } from './row'
import type { CustomSortStrategy, SortStrategy } from './sorting'

export type ColumnWidth =
  | 'grow'
  | 'growCollapse'
  | 'auto'
  | JSX.CSSProperties['width']
  | number
export type CellAlignment = 'start' | 'end' | undefined

export interface Column<Data extends UniqueRow> {
  id?: string | number
  align?: CellAlignment
  header: string | (() => JSX.Element)
  field?: ObjectPaths<Data>
  maxWidth?: string | number
  minWidth?: string | number
  renderCell?: (data: Data) => JSX.Element
  rowHeader?: boolean
  sortBy?: boolean | SortStrategy | CustomSortStrategy<Data>
  width?: ColumnWidth
}

export function createColumnHelper<T extends UniqueRow>() {
  function column(columnDefinition: Column<T>): Column<T> {
    return {
      ...columnDefinition,
      id: columnDefinition.id ?? columnDefinition.field,
    }
  }

  return {
    column,
  }
}
