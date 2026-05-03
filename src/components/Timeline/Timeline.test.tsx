import { render, screen } from '@solidjs/testing-library'
import Timeline from './Timeline'
import styles from './Timeline.module.css'

describe('Timeline', () => {
  it('applies the Timeline class and accepts class aliases', () => {
    const { container } = render(() => (
      <Timeline class="solid-class" className="react-class" />
    ))

    expect(container.firstChild).toHaveClass(styles.Timeline)
    expect(container.firstChild).toHaveClass('solid-class')
    expect(container.firstChild).toHaveClass('react-class')
  })

  it('renders with clipSidebar prop (boolean)', () => {
    const { container } = render(() => <Timeline clipSidebar />)
    expect(container.firstChild).toHaveAttribute('data-clip-sidebar', 'both')
  })

  it('renders with clipSidebar="both"', () => {
    const { container } = render(() => <Timeline clipSidebar="both" />)
    expect(container.firstChild).toHaveAttribute('data-clip-sidebar', 'both')
  })

  it('renders with clipSidebar="start"', () => {
    const { container } = render(() => <Timeline clipSidebar="start" />)
    expect(container.firstChild).toHaveAttribute('data-clip-sidebar', 'start')
  })

  it('renders with clipSidebar="end"', () => {
    const { container } = render(() => <Timeline clipSidebar="end" />)
    expect(container.firstChild).toHaveAttribute('data-clip-sidebar', 'end')
  })

  it('does not render data-clip-sidebar when clipSidebar is false', () => {
    const { container } = render(() => <Timeline clipSidebar={false} />)
    expect(container.firstChild).not.toHaveAttribute('data-clip-sidebar')
  })

  it('does not render data-clip-sidebar when clipSidebar is not provided', () => {
    const { container } = render(() => <Timeline />)
    expect(container.firstChild).not.toHaveAttribute('data-clip-sidebar')
  })
})

describe('Timeline.Item', () => {
  it('applies the expected classes', () => {
    const { container } = render(() => <Timeline.Item />)

    expect(container.firstChild).toHaveClass(styles.TimelineItem)
    expect(container.firstChild).toHaveClass('Timeline-Item')
  })

  it('renders with condensed prop', () => {
    const { container } = render(() => <Timeline.Item condensed />)

    expect(container.firstChild).toHaveAttribute('data-condensed', '')
  })
})

describe('Timeline.Badge', () => {
  it('applies the expected classes to the inner badge', () => {
    const { container } = render(() => (
      <Timeline.Badge class="solid-class" className="react-class" />
    ))

    const badge = container.querySelector(`.${styles.TimelineBadge}`)
    expect(badge).toHaveClass(styles.TimelineBadge)
    expect(badge).toHaveClass('solid-class')
    expect(badge).toHaveClass('react-class')
    expect(container.firstChild).toHaveClass(styles.TimelineBadgeWrapper)
  })

  it('renders with variant prop', () => {
    render(() => <Timeline.Badge data-testid="badge" variant="done" />)

    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'done')
  })

  it('does not render data-variant when variant is omitted', () => {
    render(() => <Timeline.Badge data-testid="badge" />)

    expect(screen.getByTestId('badge')).not.toHaveAttribute('data-variant')
  })
})

describe('Timeline.Body', () => {
  it('applies the expected class', () => {
    const { container } = render(() => <Timeline.Body />)

    expect(container.firstChild).toHaveClass(styles.TimelineBody)
  })
})

describe('Timeline.Break', () => {
  it('applies the expected class', () => {
    const { container } = render(() => <Timeline.Break />)

    expect(container.firstChild).toHaveClass(styles.TimelineBreak)
  })
})
