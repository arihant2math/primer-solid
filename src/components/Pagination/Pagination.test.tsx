import { fireEvent, render, screen } from '@solidjs/testing-library'
import { splitProps, type JSX } from 'solid-js'
import { Pagination } from './Pagination'

function RouterLikeLink(
  props: { to: string; children?: JSX.Element; class?: string; className?: string } & Omit<
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'className'
  >,
) {
  const [local, rest] = splitProps(props, ['children', 'class', 'className', 'to'])

  return (
    <a
      {...rest}
      href={local.to}
      class={local.class ?? local.className}
      data-router-link="true"
    >
      {local.children}
    </a>
  )
}

describe('Pagination', () => {
  it('renders the navigation and page data-component attributes', () => {
    const { container } = render(() => <Pagination pageCount={5} currentPage={3} />)

    expect(container.querySelector('[data-component="Pagination"]')).toBeInTheDocument()
    expect(
      container.querySelectorAll('[data-component="Pagination.Page"]').length,
    ).toBeGreaterThan(0)
    expect(
      container.querySelector('[data-component="Pagination.PreviousPage"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-component="Pagination.NextPage"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-component="Pagination.PreviousPageIcon"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-component="Pagination.NextPageIcon"]'),
    ).toBeInTheDocument()
  })

  it('supports renderPage for custom link rendering', () => {
    const { container } = render(() => (
      <Pagination
        pageCount={10}
        currentPage={1}
        renderPage={({ key: _key, number, ...props }) => (
          <RouterLikeLink to={`#${number}`} {...props} />
        )}
      />
    ))

    expect(container.querySelectorAll('a')).toHaveLength(10)
    expect(
      container.querySelectorAll('[data-component="Pagination.Page"]').length,
    ).toBeGreaterThan(0)
  })

  it('calls onPageChange with the selected page number', async () => {
    const onPageChange = vi.fn()
    render(() => (
      <Pagination pageCount={5} currentPage={3} onPageChange={onPageChange} />
    ))

    await fireEvent.click(screen.getByRole('link', { name: 'Page 4' }))

    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange).toHaveBeenCalledWith(expect.any(MouseEvent), 4)
  })

  it('marks disabled previous and next pages as hidden from assistive technology', () => {
    const { container: firstContainer } = render(() => (
      <Pagination pageCount={5} currentPage={1} />
    ))

    expect(
      firstContainer.querySelector('[data-component="Pagination.PreviousPage"]'),
    ).toHaveAttribute('aria-hidden', 'true')
    expect(
      firstContainer.querySelector('[data-component="Pagination.PreviousPage"]'),
    ).toHaveAttribute('aria-disabled', 'true')

    const { container: secondContainer } = render(() => (
      <Pagination pageCount={5} currentPage={5} />
    ))

    expect(
      secondContainer.querySelector('[data-component="Pagination.NextPage"]'),
    ).toHaveAttribute('aria-hidden', 'true')
    expect(
      secondContainer.querySelector('[data-component="Pagination.NextPage"]'),
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('serializes responsive showPages ranges onto the container', () => {
    render(() => (
      <Pagination
        pageCount={5}
        currentPage={3}
        showPages={{ narrow: false, regular: false, wide: true }}
      />
    ))

    expect(screen.getByRole('navigation')).toHaveAttribute(
      'data-component',
      'Pagination',
    )
    expect(
      screen.getByRole('navigation').firstElementChild,
    ).toHaveAttribute('data-hidden-viewport-ranges', 'narrow regular')
  })
})
