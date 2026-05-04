import { fireEvent, render, screen } from '@solidjs/testing-library'
import { DataTable, Table } from '../../index'
import { createColumnHelper } from './column'
import { getGridTemplateFromColumns } from './useTable'

describe('DataTable', () => {
  it('renders a semantic table from data and columns', () => {
    const columnHelper = createColumnHelper<{ id: number; name: string }>()
    const columns = [
      columnHelper.column({
        header: 'Name',
        field: 'name',
      }),
    ]
    const data = [
      { id: 1, name: 'one' },
      { id: 2, name: 'two' },
      { id: 3, name: 'three' },
    ]

    render(() => <DataTable data={data} columns={columns} />)

    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)
    expect(screen.getAllByRole('cell')).toHaveLength(3)
  })

  it('supports custom cell rendering, row headers, labels, and descriptions', () => {
    render(() => (
      <Table.Container>
        <Table.Title id="people-title">People</Table.Title>
        <Table.Subtitle id="people-description">Current roster</Table.Subtitle>
        <DataTable
          aria-labelledby="people-title"
          aria-describedby="people-description"
          data={[
            { id: 1, profile: { name: 'Mona' } },
            { id: 2, profile: { name: 'Jules' } },
          ]}
          columns={[
            {
              header: 'Name',
              field: 'profile.name',
              rowHeader: true,
              renderCell: (row) => <strong>{row.profile.name}</strong>,
            },
          ]}
        />
      </Table.Container>
    ))

    expect(screen.getByRole('table', { name: 'People' })).toHaveAttribute(
      'aria-describedby',
      'people-description',
    )
    expect(screen.getByRole('rowheader', { name: 'Mona' })).toBeInTheDocument()
    expect(screen.getByRole('rowheader', { name: 'Jules' })).toBeInTheDocument()
  })

  it('supports sorting and reports toggles', () => {
    const onToggleSort = vi.fn()

    render(() => (
      <DataTable
        data={[
          { id: 1, value: 1 },
          { id: 2, value: 2 },
          { id: 3, value: 3 },
        ]}
        columns={[
          {
            header: 'Value',
            field: 'value',
            sortBy: true,
          },
        ]}
        initialSortColumn="value"
        initialSortDirection="ASC"
        onToggleSort={onToggleSort}
      />
    ))

    const getOrder = () =>
      screen
        .getAllByRole('row')
        .filter((row) => row.querySelector('[role="cell"], [role="rowheader"]'))
        .map((row) => row.textContent)

    const sortButton = screen.getByRole('button', { name: 'Value' })

    expect(screen.getByRole('columnheader', { name: 'Value' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    expect(getOrder()).toEqual(['1', '2', '3'])

    fireEvent.click(sortButton)

    expect(screen.getByRole('columnheader', { name: 'Value' })).toHaveAttribute(
      'aria-sort',
      'descending',
    )
    expect(getOrder()).toEqual(['3', '2', '1'])
    expect(onToggleSort).toHaveBeenCalledWith('value', 'DESC')
  })

  it('preserves input order when externalSorting is enabled', () => {
    const onToggleSort = vi.fn()

    render(() => (
      <DataTable
        data={[
          { id: 1, value: 3 },
          { id: 2, value: 1 },
          { id: 3, value: 2 },
        ]}
        columns={[
          {
            header: 'Value',
            field: 'value',
            sortBy: true,
          },
        ]}
        externalSorting
        onToggleSort={onToggleSort}
      />
    ))

    const getOrder = () =>
      screen
        .getAllByRole('row')
        .filter((row) => row.querySelector('[role="cell"], [role="rowheader"]'))
        .map((row) => row.textContent)

    fireEvent.click(screen.getByRole('button', { name: /Value/ }))

    expect(getOrder()).toEqual(['3', '1', '2'])
    expect(screen.getByRole('columnheader', { name: 'Value' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    )
    expect(onToggleSort).toHaveBeenCalledWith('value', 'ASC')
  })

  it('builds grid templates from column widths', () => {
    const columnHelper = createColumnHelper<{ id: number; name: string }>()

    expect(
      getGridTemplateFromColumns([
        columnHelper.column({ header: 'Name', field: 'name' }),
      ]),
    ).toEqual(['minmax(max-content, 1fr)'])

    expect(
      getGridTemplateFromColumns([
        columnHelper.column({ header: 'Name', field: 'name', width: 'growCollapse' }),
      ]),
    ).toEqual(['minmax(0, 1fr)'])

    expect(
      getGridTemplateFromColumns([
        columnHelper.column({ header: 'Name', field: 'name', width: 200 }),
      ]),
    ).toEqual(['200px'])
  })
})

describe('Table', () => {
  it('renders table parts with expected semantics', () => {
    render(() => (
      <>
        <Table.Title id="table-title">Example</Table.Title>
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header>Column</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell scope="row">Cell</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </>
    ))

    expect(screen.getByRole('table')).toHaveAttribute('data-cell-padding', 'normal')
    expect(screen.getByRole('columnheader', { name: 'Column' })).toHaveAttribute(
      'scope',
      'col',
    )
    expect(screen.getByRole('rowheader', { name: 'Cell' })).toBeInTheDocument()
  })

  it('renders table skeleton content', () => {
    const columnHelper = createColumnHelper<{ id: number }>()
    const columns = [
      columnHelper.column({ header: 'Column A' }),
      columnHelper.column({ header: 'Column B' }),
    ]

    render(() => <Table.Skeleton aria-label="Loading table" columns={columns} rows={3} />)

    expect(screen.getByRole('table', { name: 'Loading table' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    expect(screen.getAllByRole('cell')).toHaveLength(2)
    expect(screen.getAllByText('Loading')).toHaveLength(2)
  })

  it('marks sortable headers with stable data-component attributes', () => {
    const { container } = render(() => (
      <DataTable
        data={[{ id: 1, value: 'test' }]}
        columns={[
          {
            header: 'Value',
            field: 'value',
            sortBy: true,
          },
        ]}
      />
    ))

    expect(
      container.querySelector('[data-component="Table.SortHeader"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-component="Table.SortHeader.Button"]'),
    ).toBeInTheDocument()
  })
})
