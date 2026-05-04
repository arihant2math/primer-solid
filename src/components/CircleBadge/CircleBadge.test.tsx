import { render, screen } from '@solidjs/testing-library'
import { CheckIcon } from '../Octicon'
import { CircleBadge } from './CircleBadge'
import styles from './CircleBadge.module.css'

describe('CircleBadge', () => {
  it('renders a div by default with the CircleBadge class', () => {
    const { container } = render(() => <CircleBadge />)

    expect(container.firstChild?.nodeName).toBe('DIV')
    expect(container.firstChild).toHaveClass(styles.CircleBadge)
  })

  it('accepts class and className', () => {
    const { container } = render(() => (
      <CircleBadge class="solid-class" className="react-class" />
    ))

    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('respects the inline prop', () => {
    const { container } = render(() => <CircleBadge inline />)
    const badge = container.firstChild as HTMLElement

    expect(badge).toHaveAttribute('data-inline', '')
    expect(badge.getAttribute('style')).toContain('width: 96px')
    expect(badge.getAttribute('style')).toContain('height: 96px')
  })

  it('respects the variant prop', () => {
    const { container } = render(() => <CircleBadge variant="large" />)
    const badge = container.firstChild as HTMLElement

    expect(badge.getAttribute('style')).toContain('width: 128px')
    expect(badge.getAttribute('style')).toContain('height: 128px')
  })

  it('uses the size prop to override the variant prop', () => {
    const { container } = render(() => (
      <CircleBadge variant="large" size={20} />
    ))
    const badge = container.firstChild as HTMLElement

    expect(badge.getAttribute('style')).toContain('width: 20px')
    expect(badge.getAttribute('style')).toContain('height: 20px')
  })

  it('applies native props to a polymorphic root', () => {
    const { container } = render(() => (
      <CircleBadge as="a" title="primer logo">
        <img alt="Example" src="primer.jpg" />
      </CircleBadge>
    ))

    expect(container.firstChild?.nodeName).toBe('A')
    expect(container.firstChild).toHaveAttribute('title', 'primer logo')
  })

  it('preserves child class names', () => {
    render(() => (
      <CircleBadge>
        <img class="primer" alt="Example" src="primer.jpg" />
      </CircleBadge>
    ))

    expect(screen.getByRole('img')).toHaveClass('primer')
  })

  it('renders CircleBadge.Icon', () => {
    const { container } = render(() => <CircleBadge.Icon icon={CheckIcon} />)
    const svg = container.querySelector('svg')

    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass(styles.CircleBadgeIcon)
    expect(svg).toHaveClass('octicon-check')
  })
})
