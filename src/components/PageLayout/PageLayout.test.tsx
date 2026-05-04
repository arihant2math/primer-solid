import { fireEvent, render, screen } from '@solidjs/testing-library'
import { PageLayout } from './PageLayout'
import styles from './PageLayout.module.css'

describe('PageLayout', () => {
  it('renders default layout regions', () => {
    const { container } = render(() => (
      <PageLayout>
        <PageLayout.Header>Header</PageLayout.Header>
        <PageLayout.Content>Content</PageLayout.Content>
        <PageLayout.Pane>Pane</PageLayout.Pane>
        <PageLayout.Footer>Footer</PageLayout.Footer>
      </PageLayout>
    ))

    expect(container.firstChild).toHaveClass(styles.PageLayoutRoot)
    expect(screen.getByRole('banner')).toHaveTextContent('Header')
    expect(screen.getByRole('main')).toHaveTextContent('Content')
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Footer')
    expect(screen.getByText('Pane')).toBeInTheDocument()
  })

  it('supports a custom element type for content', () => {
    const { container } = render(() => (
      <PageLayout.Content as="div">Content</PageLayout.Content>
    ))

    expect(container.firstChild?.nodeName).toBe('DIV')
    expect(container.firstChild).toHaveClass(styles.ContentWrapper)
  })

  it('forwards pane refs to the inner pane element', () => {
    let element: HTMLDivElement | undefined

    render(() => (
      <PageLayout>
        <PageLayout.Pane ref={(node) => (element = node)}>
          <div data-testid="pane-content">Pane</div>
        </PageLayout.Pane>
      </PageLayout>
    ))

    expect(element).toBe(screen.getByTestId('pane-content').parentElement)
    expect(element).toHaveClass(styles.Pane)
  })

  it('renders a slider and applies keyboard resize state when resizable', () => {
    const { container } = render(() => (
      <PageLayout>
        <PageLayout.Pane resizable>Pane</PageLayout.Pane>
        <PageLayout.Content>Content</PageLayout.Content>
      </PageLayout>
    ))

    const handle = screen.getByRole('slider')
    const contentWrapper = container.querySelector(
      `[class*="${styles.ContentWrapper}"]`,
    ) as HTMLElement

    fireEvent.keyDown(handle, { key: 'ArrowRight' })

    expect(contentWrapper).toHaveAttribute('data-dragging', 'true')
    expect(handle).toHaveAttribute('aria-valuenow')
  })

  it('renders a sidebar and supports resizable sidebar handles', () => {
    render(() => (
      <PageLayout>
        <PageLayout.Content>Content</PageLayout.Content>
        <PageLayout.Sidebar
          resizable
          width={{ min: '256px', default: '296px', max: '768px' }}
        >
          Sidebar
        </PageLayout.Sidebar>
      </PageLayout>
    ))

    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })
})
