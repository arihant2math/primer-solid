import { render, screen } from '@solidjs/testing-library'
import { Hidden } from './Hidden'
import styles from './Hidden.module.css'

describe('Hidden', () => {
  it('renders a <div> by default', () => {
    const { container } = render(() => <Hidden when="regular" />)

    expect(container.firstChild?.nodeName).toBe('DIV')
  })

  it('renders children', () => {
    render(() => <Hidden when="regular">Hello World</Hidden>)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <Hidden when="regular" class="solid-class" className="react-class" />
    ))

    expect(container.firstChild).toHaveClass(styles.Hidden)
    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('sets the expected style variable for a single viewport', () => {
    const { container } = render(() => (
      <Hidden when="regular" data-testid="hidden-regular">
        <div>This is hidden on regular viewports</div>
      </Hidden>
    ))

    const element = container.querySelector(
      '[data-testid="hidden-regular"]',
    ) as HTMLElement | null

    expect(element?.style.getPropertyValue('--hiddenDisplay-regular')).toBe('none')
    expect(element?.style.getPropertyValue('--hiddenDisplay-narrow')).toBe('')
    expect(element?.style.getPropertyValue('--hiddenDisplay-wide')).toBe('')
  })

  it('sets the expected style variables for multiple viewports', () => {
    const { container } = render(() => (
      <Hidden when={["narrow", "wide"]} data-testid="hidden-multiple">
        <div>This is hidden on narrow and wide viewports</div>
      </Hidden>
    ))

    const element = container.querySelector(
      '[data-testid="hidden-multiple"]',
    ) as HTMLElement | null

    expect(element?.style.getPropertyValue('--hiddenDisplay-narrow')).toBe('none')
    expect(element?.style.getPropertyValue('--hiddenDisplay-regular')).toBe('')
    expect(element?.style.getPropertyValue('--hiddenDisplay-wide')).toBe('none')
  })

  it('passes through native div props', () => {
    render(() => (
      <Hidden when="wide" data-testid="hidden" aria-live="polite" style={{ color: 'red' }}>
        Hello
      </Hidden>
    ))

    const element = screen.getByTestId('hidden')

    expect(element).toHaveAttribute('aria-live', 'polite')
    expect(element).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(element.style.getPropertyValue('--hiddenDisplay-wide')).toBe('none')
  })
})
