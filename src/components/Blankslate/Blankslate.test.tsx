import { fireEvent, render, screen } from '@solidjs/testing-library'
import { Blankslate } from './index'
import styles from './Blankslate.module.css'

describe('Blankslate', () => {
  it('renders the container and applies class and className to the inner blankslate element', () => {
    const { container } = render(() => (
      <Blankslate class="solid-class" className="react-class" id="root">
        Test content
      </Blankslate>
    ))

    expect(container.firstChild).toHaveClass(styles.Container)
    expect(container.firstChild).toHaveAttribute('id', 'root')
    expect(container.firstChild?.firstChild).toHaveClass(styles.Blankslate)
    expect(container.firstChild?.firstChild).toHaveClass('solid-class')
    expect(container.firstChild?.firstChild).toHaveClass('react-class')
  })

  it('renders border, narrow, spacious, and size data attributes', () => {
    const { container } = render(() => (
      <Blankslate border narrow spacious size="large">
        Test content
      </Blankslate>
    ))

    const blankslate = container.firstChild?.firstChild as HTMLElement

    expect(blankslate).toHaveAttribute('data-border', '')
    expect(blankslate).toHaveAttribute('data-narrow', '')
    expect(blankslate).toHaveAttribute('data-spacious', '')
    expect(blankslate).toHaveAttribute('data-size', 'large')
  })

  it('renders a visual element', () => {
    render(() => (
      <Blankslate>
        <Blankslate.Visual>
          <svg aria-hidden="true" data-testid="test-icon" />
        </Blankslate.Visual>
      </Blankslate>
    ))

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('renders a heading with h2 by default and supports custom levels', () => {
    const first = render(() => (
      <Blankslate>
        <Blankslate.Heading>Test Heading</Blankslate.Heading>
      </Blankslate>
    ))

    expect(
      screen.getByRole('heading', { level: 2, name: 'Test Heading' }),
    ).toHaveClass('Blankslate-Heading')

    first.unmount()

    render(() => (
      <Blankslate>
        <Blankslate.Heading as="h3">Test Heading</Blankslate.Heading>
      </Blankslate>
    ))

    expect(
      screen.getByRole('heading', { level: 3, name: 'Test Heading' }),
    ).toBeInTheDocument()
  })

  it('renders a description', () => {
    render(() => (
      <Blankslate>
        <Blankslate.Description>Test description</Blankslate.Description>
      </Blankslate>
    ))

    expect(screen.getByText('Test description')).toBeInTheDocument()
  })

  it('renders a primary action button and handles clicks', () => {
    const onClick = vi.fn()

    render(() => (
      <Blankslate>
        <Blankslate.PrimaryAction onClick={onClick}>
          Primary action
        </Blankslate.PrimaryAction>
      </Blankslate>
    ))

    const button = screen.getByRole('button', { name: 'Primary action' })
    fireEvent.click(button)

    expect(button).toBeInTheDocument()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders the primary action as a link when href is provided', () => {
    render(() => (
      <Blankslate>
        <Blankslate.PrimaryAction href="https://example.com">
          Primary action
        </Blankslate.PrimaryAction>
      </Blankslate>
    ))

    const link = screen.getByRole('link', { name: 'Primary action' })

    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('uses the small button size for the primary action when the blankslate size is small', () => {
    render(() => (
      <Blankslate size="small">
        <Blankslate.PrimaryAction>Primary action</Blankslate.PrimaryAction>
      </Blankslate>
    ))

    expect(screen.getByRole('button', { name: 'Primary action' })).toHaveAttribute(
      'data-size',
      'small',
    )
  })

  it('renders a secondary action link', () => {
    render(() => (
      <Blankslate>
        <Blankslate.SecondaryAction href="https://example.com">
          Secondary action
        </Blankslate.SecondaryAction>
      </Blankslate>
    ))

    const link = screen.getByRole('link', { name: 'Secondary action' })

    expect(link).toHaveAttribute('href', 'https://example.com')
  })
})
